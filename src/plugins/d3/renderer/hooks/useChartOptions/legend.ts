import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedLegend} from './types';

const LEGEND_LINE_HEIGHT = 15;
const LEGEND_SYMBOL_SIZE = 10;

export const getPreparedLegend = (args: {
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series'];
}): PreparedLegend => {
    const {legend, series} = args;
    const enabled = typeof legend?.enabled === 'boolean' ? legend?.enabled : series.data.length > 1;
    const height = enabled ? LEGEND_LINE_HEIGHT : 0;
    const symbolHeight = legend?.symbol?.height || LEGEND_SYMBOL_SIZE;

    return {
        align: legend?.align || 'center',
        enabled,
        itemDistance: legend?.itemDistance || 20,
        symbol: {
            width: legend?.symbol?.width || LEGEND_SYMBOL_SIZE,
            height: symbolHeight,
            radius: legend?.symbol?.width || symbolHeight / 2,
            padding: legend?.symbol?.padding || 5,
        },

        height,
    };
};
