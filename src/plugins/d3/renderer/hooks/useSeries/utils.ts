import memoize from 'lodash/memoize';
import {PreparedLegendSymbol, PreparedSeries, StackedSeries} from './types';
import {ChartKitWidgetSeries} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';
import {DEFAULT_LEGEND_SYMBOL_PADDING, DEFAULT_LEGEND_SYMBOL_SIZE} from './constants';
import {SymbolType} from '../../../../../constants';

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

export function prepareLegendSymbol(
    series: ChartKitWidgetSeries,
    symbolType?: `${SymbolType}`,
): PreparedLegendSymbol {
    const symbolOptions = series.legend?.symbol || {};

    return {
        shape: 'symbol',
        symbolType: symbolType || SymbolType.Circle,
        width: symbolOptions?.width || DEFAULT_LEGEND_SYMBOL_SIZE,
        padding: symbolOptions?.padding || DEFAULT_LEGEND_SYMBOL_PADDING,
    };
}

const getCommonStackId = memoize(getRandomCKId);

export function getSeriesStackId(series: StackedSeries) {
    let stackId = series.stackId;

    if (!stackId) {
        stackId = series.stacking ? getCommonStackId() : getRandomCKId();
    }

    return stackId;
}
