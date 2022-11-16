import type {Highcharts} from '../../../../types';
import {getXAxisThresholdValue} from './getXAxisThresholdValue';

const MOCKED_SERIES = [
    {data: [{x: 1}, {x: 2}, {x: -11}, {x: 0}, {x: 1}]},
    {data: [{x: 100}, {x: -1232}]},
    {data: []},
] as Highcharts.Series[];

describe('plugins/highcharts/config/getXAxisThresholdValue', () => {
    it("should return maximun value from x axis in case of 'max' operation", () => {
        const result = getXAxisThresholdValue(MOCKED_SERIES, 'max');
        expect(result).toEqual(100);
    });

    it("should return minimum value from x axis in case of 'min' operation", () => {
        const result = getXAxisThresholdValue(MOCKED_SERIES, 'min');
        expect(result).toEqual(-1232);
    });

    it.each([['min'], ['max']])('should return null in case of empty series array', (operation) => {
        const result = getXAxisThresholdValue([], operation as 'min' | 'max');
        expect(result).toBeNull();
    });
});
