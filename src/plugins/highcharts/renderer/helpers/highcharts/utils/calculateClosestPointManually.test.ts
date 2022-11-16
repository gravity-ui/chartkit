import {calculateClosestPointManually} from './calcucalteClosestPointManually';

describe('calculateClosestPointManually', () => {
    it('Должна вернуть наименьшее расстояние между точками и если оно больше 0', () => {
        const MOCKED_SERIES = [
            {
                processedXData: [1, 5, 12],
            },
            {
                processedXData: [12, 65],
            },
            {
                processedXData: [3, 140],
            },
        ] as any[];

        const MOCKED_CONTEXT = {
            series: MOCKED_SERIES,
        };

        const expectedResult = 2;
        const result = calculateClosestPointManually.apply(MOCKED_CONTEXT);

        expect(result).toEqual(expectedResult);
    });

    it('Должна вернуть undefined, если передан пустой массив', () => {
        const MOCKED_CONTEXT = {series: []};
        const result = calculateClosestPointManually.apply(MOCKED_CONTEXT);

        expect(result).toBeUndefined();
    });

    it('Должна вернуть undefined, если наименьшее расстояние это 0', () => {
        const MOCKED_SERIES = [
            {
                processedXData: [12],
            },
            {
                processedXData: [12],
            },
        ] as any[];

        const MOCKED_CONTEXT = {
            series: MOCKED_SERIES,
        };

        const result = calculateClosestPointManually.apply(MOCKED_CONTEXT);

        expect(result).toBeUndefined();
    });
});
