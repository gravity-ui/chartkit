import {calculatePrecision} from './calculatePrecision';

describe('plugins/highcharts/config/calculatePrecision', () => {
    test('should return undefined', () => {
        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: false})).toEqual(
            undefined,
        );

        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: false}, 1)).toEqual(
            undefined,
        );
    });

    test('should return 2 in case of some of normalized options are initialized', () => {
        expect(calculatePrecision(null, {normalizeDiv: true, normalizeSub: false}, 99)).toEqual(2);

        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: true}, 99.99)).toEqual(
            2,
        );

        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: true})).toEqual(2);

        expect(calculatePrecision(10, {normalizeDiv: true, normalizeSub: true})).toEqual(2);
    });

    test('should return precision value from func arguments', () => {
        expect(
            calculatePrecision(null, {normalizeDiv: false, normalizeSub: false, precision: 3}),
        ).toEqual(3);

        expect(
            calculatePrecision(
                null,
                {normalizeDiv: true, normalizeSub: false, precision: 4},
                99.99,
            ),
        ).toEqual(4);

        expect(
            calculatePrecision(null, {normalizeDiv: false, normalizeSub: true, precision: 5}, 99),
        ).toEqual(5);

        expect(
            calculatePrecision(10, {normalizeDiv: false, normalizeSub: false, precision: 3}),
        ).toEqual(3);
    });

    test('should return alternativePrecision value from func arguments', () => {
        expect(calculatePrecision(10, {normalizeDiv: false, normalizeSub: false})).toEqual(10);

        expect(calculatePrecision(10, {normalizeDiv: false, normalizeSub: false}, 99)).toEqual(10);

        expect(calculatePrecision(10, {normalizeDiv: false, normalizeSub: false}, 99.99)).toEqual(
            10,
        );
    });

    test('should return 2 for decimal number by default', () => {
        expect(
            calculatePrecision(null, {normalizeDiv: false, normalizeSub: false}, 0.1111111),
        ).toEqual(2);
    });
});
