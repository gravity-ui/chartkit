import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedLegend} from './types';

export const getPreparedLegend = (args: {
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series'];
}): PreparedLegend => {
    const {legend, series} = args;
    const enabled = legend?.enabled;

    return {
        enabled: typeof enabled === 'boolean' ? enabled : series.data.length > 1,
    };
};
