import {PreparedLegendSymbol, PreparedSeries} from './types';
import {ChartKitWidgetSeries, RectLegendSymbolOptions} from '../../../../../types';
import {DEFAULT_LEGEND_SYMBOL_SIZE} from './constants';

export const getActiveLegendItems = (series: PreparedSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        if (s.legend.enabled && s.visible) {
            acc.push(s.name);
        }

        return acc;
    }, []);
};

export const getAllLegendItems = (series: PreparedSeries[]) => {
    return series.map((s) => s.name);
};

export function prepareLegendSymbol(series: ChartKitWidgetSeries): PreparedLegendSymbol {
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
