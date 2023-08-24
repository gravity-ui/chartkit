import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedLegend} from './types';

const LEGEND_LINE_HEIGHT = 15;

export const getPreparedLegend = (args: {
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series'];
}): PreparedLegend => {
    const {legend, series} = args;
    const enabled = typeof legend?.enabled === 'boolean' ? legend?.enabled : series.data.length > 1;
    const height = enabled ? LEGEND_LINE_HEIGHT : 0;

    return {
        align: legend?.align || 'center',
        enabled,
        itemDistance: legend?.itemDistance || 20,
        height,
    };
};
