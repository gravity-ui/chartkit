import memoize from 'lodash/memoize';
import {PreparedLegendSymbol, PreparedSeries, StackedSeries} from './types';
import {ChartKitWidgetSeries} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';
import {getScatterStyle} from '../../utils';
import {ScatterSeries} from '../../../../../types/widget-data';

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
    index: number,
): PreparedLegendSymbol {
    const scatterStyle = (series as ScatterSeries).symbol || getScatterStyle(index);

    return {
        shape: 'symbol',
        style: scatterStyle,
        padding: 0,
        width: 8,
    };
}

const getCommonStackId = memoize(getRandomCKId);

export function getSeriesStackId(series: StackedSeries) {
    let stackId = series.stackId;

    if (!stackId) {
        stackId = series.stacking === 'normal' ? getCommonStackId() : getRandomCKId();
    }

    return stackId;
}
