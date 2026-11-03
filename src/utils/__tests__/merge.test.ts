import type {MergeCustomizer} from '../merge';
import {merge, mergeWith} from '../merge';

describe('utils/merge', () => {
    it('merges an object shared by several paths into each path on its own', () => {
        const shared = {width: 2};

        const result = merge({a: {color: 'red'}, b: {color: 'blue'}}, {a: shared, b: shared});

        expect(result).toEqual({a: {color: 'red', width: 2}, b: {color: 'blue', width: 2}});
    });

    it('keeps the paths of an object shared by several paths apart for later sources', () => {
        const shared = {states: {hover: {lineWidthPlus: 1}}};

        const result = merge(
            {},
            {spline: shared, areaspline: shared},
            {spline: {states: {hover: {lineWidthPlus: 5}}}},
        );

        expect(result.areaspline.states.hover.lineWidthPlus).toBe(1);
        expect(result.spline.states.hover.lineWidthPlus).toBe(5);
        expect(shared.states.hover.lineWidthPlus).toBe(1);
    });

    it('does not change a source object merged in place of a primitive', () => {
        const source = {a: {x: 1}};

        merge({}, {a: 5}, source, {a: {y: 2}});

        expect(source).toEqual({a: {x: 1}});
    });

    it('puts a date of a source in place of a target object', () => {
        const date = new Date(0);

        expect(merge({a: {x: 1}}, {a: date}).a).toBe(date);
    });

    it('does not change a source object merged in place of a function', () => {
        const source = {a: {x: 1}};

        merge({a: () => 1}, source, {a: {y: 2}});

        expect(source).toEqual({a: {x: 1}});
    });

    it('keeps functions and handles cycles in a source with shared objects', () => {
        const format = () => 'x';
        const shared: Record<string, unknown> = {format};
        shared.self = shared;

        const result = merge({}, {a: shared, b: shared});

        expect(result.a.format).toBe(format);
        expect(result.b.format).toBe(format);
    });
});

describe('utils/mergeWith', () => {
    // Merges every item of an array source with the target object, as the highcharts config does.
    const mergeItems: MergeCustomizer = (objValue, srcValue) => {
        if (Array.isArray(srcValue) && objValue && typeof objValue === 'object') {
            return Array.isArray(objValue)
                ? undefined
                : srcValue.map((value) => merge({}, objValue, value));
        }
        return undefined;
    };

    it('passes the target object to the customizer for an array source', () => {
        const result = mergeWith({y: {a: 1}}, {y: [{b: 2}, {c: 3}]}, mergeItems);

        expect(result.y).toEqual([
            {a: 1, b: 2},
            {a: 1, c: 3},
        ]);
    });

    it('passes the target array itself to the customizer for an array source', () => {
        const list = [1];
        const customizer = vi.fn<MergeCustomizer>(() => undefined);

        mergeWith({list}, {list: [2]}, customizer);

        expect(customizer.mock.calls[0][0]).toBe(list);
    });

    it('takes the value the customizer returns', () => {
        const result = mergeWith({a: 1, b: {x: 1}}, {a: 2, b: {y: 2}}, (objValue, srcValue, key) =>
            key === 'a' ? [objValue, srcValue] : undefined,
        );

        expect(result).toEqual({a: [1, 2], b: {x: 1, y: 2}});
    });

    it('merges as merge does where the customizer returns undefined', () => {
        const date = new Date(0);
        const shared = {width: 2};
        const source = {f: {x: 1}};

        const result = mergeWith(
            {f: () => 1, d: {x: 1}, a: {color: 'red'}, b: {color: 'blue'}},
            {d: date, a: shared, b: shared},
            source,
            () => undefined,
        );
        merge(result, {f: {y: 2}});

        expect(result.d).toBe(date);
        expect(result.a).toEqual({color: 'red', width: 2});
        expect(result.b).toEqual({color: 'blue', width: 2});
        expect(source).toEqual({f: {x: 1}});
    });

    it('uses the customizer in an object merged in place of a function', () => {
        const keys: string[] = [];

        mergeWith({a: () => 1}, {a: {y: 1}}, (_objValue, _srcValue, key) => {
            keys.push(key);
            return undefined;
        });

        expect(keys).toEqual(['a', 'y']);
    });
});
