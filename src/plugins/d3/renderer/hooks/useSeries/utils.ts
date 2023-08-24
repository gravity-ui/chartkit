import {ChartKitWidgetSeries, RectLegendSymbolOptions} from '../../../../../types/widget-data';
import {isAxisRelatedSeries} from '../../utils';
import get from 'lodash/get';
import {PreparedLegendSymbol} from './types';

export const getActiveLegendItems = (series: ChartKitWidgetSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        const isAxisRelated = isAxisRelatedSeries(s);
        const isLegendEnabled = get(s, 'legend.enabled', true);
        const isSeriesVisible = get(s, 'visible', true);

        if (isLegendEnabled && isAxisRelated && isSeriesVisible && 'name' in s) {
            acc.push(s.name);
        } else if (isLegendEnabled && !isAxisRelated) {
            s.data.forEach((d) => {
                const isDataVisible = get(d, 'visible', true);

                if (isDataVisible && 'name' in d) {
                    acc.push(d.name);
                }
            });
        }

        return acc;
    }, []);
};

export const getAllLegendItems = (series: ChartKitWidgetSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        if (isAxisRelatedSeries(s) && 'name' in s) {
            acc.push(s.name);
        } else {
            acc.push(...s.data.map((d) => ('name' in d && d.name) || ''));
        }

        return acc;
    }, []);
};

const DEFAULT_LEGEND_SYMBOL_SIZE = 10;

export function prepareLegendSymbol(series: ChartKitWidgetSeries): PreparedLegendSymbol {
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
