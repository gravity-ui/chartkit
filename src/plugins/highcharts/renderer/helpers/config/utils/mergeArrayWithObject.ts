import merge from 'lodash/merge';

export const mergeArrayWithObject = (a: unknown[] | unknown, b: unknown[] | unknown) => {
    if (Array.isArray(a) && b && typeof b === 'object' && !Array.isArray(b)) {
        return a.map((value) => merge(value, b));
    }

    if (Array.isArray(b) && a && typeof a === 'object' && !Array.isArray(a)) {
        return b.map((value) => merge({}, a, value));
    }

    return undefined;
};
