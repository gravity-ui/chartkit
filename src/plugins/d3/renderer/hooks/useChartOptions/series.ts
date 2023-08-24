import {
    ChartKitWidgetData,
    ChartKitWidgetSeries,
    LegendSymbol,
    RectLegendSymbolOptions,
} from '../../../../../types/widget-data';
import {PreparedLegend, PreparedSeries} from './types';

const DEFAULT_LEGEND_SYMBOL_SIZE = 10;

function prepareLegendSymbol(series: ChartKitWidgetSeries): LegendSymbol {
    switch (series.type) {
        default: {
            const symbolOptions: RectLegendSymbolOptions = series.legend?.symbol || {};
            const symbolHeight = symbolOptions?.height || DEFAULT_LEGEND_SYMBOL_SIZE;

            return {
                shape: 'rect',
                width: symbolOptions?.width || DEFAULT_LEGEND_SYMBOL_SIZE,
                height: symbolHeight,
                radius: symbolOptions?.radius || symbolHeight / 2,
                padding: symbolOptions?.padding || 5,
            };
        }
    }
}

export const getPreparedSeries = (args: {
    legend: PreparedLegend;
    series: ChartKitWidgetData['series'];
}): PreparedSeries[] => {
    const {legend, series} = args;

    return series.data.map<PreparedSeries>((singleSeries) => {
        const legendEnabled =
            typeof singleSeries.legend?.enabled === 'boolean'
                ? singleSeries.legend.enabled
                : legend.enabled;

        return {
            ...singleSeries,
            legend: {
                enabled: legendEnabled,
                symbol: prepareLegendSymbol(singleSeries),
            },
        };
    });
};
