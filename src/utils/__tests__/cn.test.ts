import {NAMESPACE, block} from '../cn';

describe('utils/block', () => {
    it('Should return namespace only', () => {
        const result = block()();
        expect(result).toBe(NAMESPACE);
    });

    it('Should return class name like "<namespace>-value"', () => {
        const result = block('loader')();
        expect(result).toBe(`${NAMESPACE}-loader`);
    });
});
