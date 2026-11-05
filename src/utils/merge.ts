import isArrayLikeObject from 'es-toolkit/compat/isArrayLikeObject';
// eslint-disable-next-line no-restricted-imports -- the wrapper that other code uses instead
import esMergeWith from 'es-toolkit/compat/mergeWith';

export type MergeCustomizer = (
    objValue: unknown,
    srcValue: unknown,
    key: string,
    object: unknown,
    source: unknown,
) => unknown;

type InnerCustomizer = (
    objValue: unknown,
    srcValue: unknown,
    key: PropertyKey,
    object: Record<PropertyKey, unknown>,
    source: unknown,
    stack?: Map<unknown, unknown>,
) => unknown;

// An array, or a plain object of any realm: its prototype is null or a root prototype, such as the
// Object.prototype of an iframe. Lodash and es-toolkit treat such objects as plain, too.
function isPlainContainer(value: unknown): value is object {
    if (Array.isArray(value)) {
        return true;
    }
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || Object.getPrototypeOf(prototype) === null;
}

// What unshare walks and copies. React components and elements, such as the React.lazy renderer of
// a plugin in the settings, are plain objects with $$typeof, and a copy would lose their identity.
function isOptionContainer(value: unknown): value is object {
    return isPlainContainer(value) && !('$$typeof' in value);
}

// The keys es-toolkit merges in an object: own enumerable strings except __proto__, which it skips,
// then own enumerable symbols. In an array it merges the indexes of a copy made by slice.
function ownEnumerableKeys(value: object) {
    const keys: PropertyKey[] = Object.keys(value);
    const protoIndex = keys.indexOf('__proto__');
    if (protoIndex !== -1) {
        keys.splice(protoIndex, 1);
    }
    for (const symbol of Object.getOwnPropertySymbols(value)) {
        if (Object.prototype.propertyIsEnumerable.call(value, symbol)) {
            keys.push(symbol);
        }
    }
    return keys;
}

// Whether one plain object or array sits at several paths. A cycle back to an ancestor is not
// sharing: es-toolkit handles cycles itself. `visited` maps a container to true while its paths
// are walked and to false after. Sources may hold series data, so arrays go by index and
// primitives are skipped without a call.
function hasSharedPaths(value: object, visited: Map<object, boolean>): boolean {
    const state = visited.get(value);
    if (state !== undefined) {
        return !state;
    }
    visited.set(value, true);
    const keys = Array.isArray(value) ? undefined : ownEnumerableKeys(value);
    const length = keys ? keys.length : (value as unknown[]).length;
    let shared = false;
    for (let i = 0; i < length && !shared; i++) {
        const child = (value as Record<PropertyKey, unknown>)[keys ? keys[i] : i];
        shared = isOptionContainer(child) && hasSharedPaths(child, visited);
    }
    visited.set(value, false);
    return shared;
}

// Copies plain objects and arrays so that every path gets an object of its own. Other values, such
// as functions, dates, class instances or React components, stay as they are. A cycle points to the
// copy of its ancestor, so that the copy has no shared paths either.
function copyPaths(value: unknown, ancestorCopies: Map<object, unknown>): unknown {
    if (!isOptionContainer(value)) {
        return value;
    }
    const ancestorCopy = ancestorCopies.get(value);
    if (ancestorCopy !== undefined) {
        return ancestorCopy;
    }
    const keys = Array.isArray(value) ? undefined : ownEnumerableKeys(value);
    const copy: Record<PropertyKey, unknown> = keys
        ? Object.create(Object.getPrototypeOf(value))
        : new Array((value as unknown[]).length);
    ancestorCopies.set(value, copy);
    const length = keys ? keys.length : (value as unknown[]).length;
    for (let i = 0; i < length; i++) {
        const key = keys ? keys[i] : i;
        copy[key] = copyPaths((value as Record<PropertyKey, unknown>)[key], ancestorCopies);
    }
    ancestorCopies.delete(value);
    return copy;
}

// Where es-toolkit's merge differs from lodash's, returns the value lodash would put in place.
function mergeValue(target: unknown, source: unknown, customizer: InnerCustomizer): unknown {
    if (source === null || typeof source !== 'object') {
        return undefined;
    }
    // es-toolkit merges a typed array or a DataView into a plain target object. Lodash merges a typed
    // array into an array target, or into an array copy of an array-like one, and otherwise puts a
    // copy of the typed array in place; a DataView it puts in place as it is.
    if (ArrayBuffer.isView(source)) {
        if (Object.prototype.toString.call(source) === '[object DataView]') {
            return source;
        }
        if (Array.isArray(target)) {
            return undefined;
        }
        if (isArrayLikeObject(target)) {
            return esMergeWith(Array.from(target as ArrayLike<unknown>), source, customizer);
        }
        return (source as unknown as {slice(): unknown}).slice();
    }
    // Lodash puts a Date, a Map, a class instance or another non-plain object in place as it is;
    // es-toolkit merges it into a plain object of the target, which loses it.
    if (!isPlainContainer(source)) {
        return source;
    }
    // In place of a function or a primitive, es-toolkit puts the source object itself, so that a
    // later source changes the user's object; lodash merges it into a new one.
    if (target !== null && target !== undefined && typeof target !== 'object') {
        return esMergeWith(Array.isArray(source) ? [] : {}, source, customizer);
    }
    return undefined;
}

function withLodashValues(root: unknown, customizer?: MergeCustomizer): InnerCustomizer {
    const merged: InnerCustomizer = (objValue, srcValue, key, object, source, stack) => {
        // A cycle back to an ancestor, the only way a source object can be on es-toolkit's stack once
        // unshare has run: es-toolkit puts a copy of the ancestor's partial result in place, lodash
        // the result itself. Lodash keeps the root source off its stack, so it merges a cycle back
        // to the root into a new object.
        const stacked =
            srcValue !== null && typeof srcValue === 'object' ? stack?.get(srcValue) : undefined;
        if (stacked !== undefined && isOptionContainer(srcValue)) {
            return stacked === root
                ? esMergeWith(Array.isArray(srcValue) ? [] : {}, srcValue, merged)
                : stacked;
        }
        // es-toolkit also merges symbol keys; lodash calls the customizer for string keys only.
        if (customizer && typeof key === 'string') {
            // For an array source, es-toolkit passes a copy of the target value, or [] in place of
            // an object; lodash passes the target value itself, and customizers rely on it.
            const value = customizer(object[key], srcValue, key, object, source);
            if (value !== undefined) {
                return value;
            }
        }
        return mergeValue(objValue, srcValue, merged);
    };
    return merged;
}

function unshare(source: unknown) {
    return isOptionContainer(source) && hasSharedPaths(source, new Map())
        ? copyPaths(source, new Map())
        : source;
}

/**
 * es-toolkit's merge from the compat layer, for user options. When one object of a source sits at
 * several paths, es-toolkit merges it once and reuses that result for the other paths: a default
 * shared by two series types would get the user options of the first type. Such a source is copied
 * first, so every path is merged on its own, as lodash did. Dates, class instances and other
 * non-plain objects of a source replace the target value, typed arrays are copied, a source object
 * that replaces a function or a primitive is copied, and a cycle points to the merged ancestor, also
 * as in lodash.
 */
export function merge<T, U>(object: T, source: U): T & U;
export function merge<T, U, V>(object: T, source1: U, source2: V): T & U & V;
export function merge<T, U, V, W>(object: T, source1: U, source2: V, source3: W): T & U & V & W;
export function merge(object: unknown, ...sources: unknown[]) {
    return esMergeWith(object, ...sources.map(unshare), withLodashValues(object));
}

/**
 * merge with a customizer, as lodash's mergeWith: the customizer gets the target value itself and
 * decides first; where it returns undefined, the values are merged as by merge.
 */
export function mergeWith<T, U>(object: T, source: U, customizer: MergeCustomizer): T & U;
export function mergeWith<T, U, V>(
    object: T,
    source1: U,
    source2: V,
    customizer: MergeCustomizer,
): T & U & V;
export function mergeWith(object: unknown, ...args: unknown[]) {
    const customizer = args.pop() as MergeCustomizer;
    return esMergeWith(object, ...args.map(unshare), withLodashValues(object, customizer));
}
