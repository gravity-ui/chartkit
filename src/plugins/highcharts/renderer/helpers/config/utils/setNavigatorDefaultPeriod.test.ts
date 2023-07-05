import type {Highcharts} from '../../../../types';
import type {NavigatorPeriod} from '../types';

import {getDefaultPeriodInMS} from './setNavigatorDefaultPeriod';

const date1 = new Date('2021-01-01');
const date2 = new Date('2021-01-02');
const date3 = new Date('2021-01-03');

const MOCKED_SERIES = [
    {
        data: [{x: date1.valueOf()}, {x: date3.valueOf()}],
    },
    {
        data: [{x: date2.valueOf()}],
    },
] as Highcharts.Series[];

const DAY_MIN_RANGE = 60 * 60 * 1000 * 24;
const HOUR_MIN_RANGE = 60 * 60 * 1000;

describe('plugins/highcharts/config/getDefaultPeriodInMS', () => {
    let settings: NavigatorPeriod;
    beforeEach(() => {
        settings = {
            type: 'date',
            value: '2',
            period: 'day',
        };
    });
    it('should return range & minRange for date in ms', () => {
        const result = getDefaultPeriodInMS(settings, MOCKED_SERIES);

        const expectedResult = {
            minRange: DAY_MIN_RANGE,
            range: date3.valueOf() - date1.valueOf(),
        };

        expect(result).toEqual(expectedResult);
    });

    it(`should set {minRange: ${HOUR_MIN_RANGE}} in case of settings.type !== 'date'`, () => {
        settings.type = 'datetime';
        const result = getDefaultPeriodInMS(settings, MOCKED_SERIES);

        const expectedResult = {
            minRange: HOUR_MIN_RANGE,
            range: date3.valueOf() - date1.valueOf(),
        };

        expect(result).toEqual(expectedResult);
    });

    it('should return null in case of empty series', () => {
        const result = getDefaultPeriodInMS(settings, []);

        expect(result).toBeNull();
    });
});
