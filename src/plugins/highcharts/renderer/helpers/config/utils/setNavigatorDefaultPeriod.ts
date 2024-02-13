import {dateTime} from '@gravity-ui/date-utils';

import type {Highcharts} from '../../../../types';
import type {NavigatorPeriod} from '../types';

import {getXAxisThresholdValue} from './getXAxisThresholdValue';

type SetNavigatorDefaultPeriod = {
    params: Record<string, any>;
    periodSettings: NavigatorPeriod;
};

type NavigatorPeriodInMS = {
    minRange: number;
    range: number;
};
const HOUR_IN_MS = 1000 * 60 * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

export const setNavigatorDefaultPeriod = ({params, periodSettings}: SetNavigatorDefaultPeriod) => {
    const periodInMS = getDefaultPeriodInMS(periodSettings, params.series);

    if (!periodInMS) {
        return;
    }

    const {range, minRange} = periodInMS;
    params.xAxis.range = range;
    params.xAxis.minRange = minRange;
};

export const getDefaultPeriodInMS = (
    periodSettings: NavigatorPeriod,
    series: Highcharts.Series[],
): NavigatorPeriodInMS | null => {
    const {type, value, period} = periodSettings;
    const minRange = type === 'date' ? DAY_IN_MS : HOUR_IN_MS;
    const maxXValue = getXAxisThresholdValue(series, 'max');

    if (maxXValue === null) {
        return null;
    }

    const minXValue = dateTime({input: maxXValue}).subtract(value, period);
    const range = maxXValue - minXValue.valueOf();

    return {
        minRange,
        range,
    };
};
