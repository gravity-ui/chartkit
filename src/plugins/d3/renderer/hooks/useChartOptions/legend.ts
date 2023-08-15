import get from 'lodash/get';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedLegend} from './types';

export const getPreparedLegend = (args: {
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series'];
}): PreparedLegend => {
    const {legend, series} = args;
    return {enabled: get(legend, 'enabled', true) && series.length > 1};
};
