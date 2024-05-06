import type {ScaleOrdinal} from 'd3';
import get from 'lodash/get';

import type {WaterfallSeries} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';
import {DEFAULT_PALETTE} from '../../constants';

import {DEFAULT_DATALABELS_PADDING, DEFAULT_DATALABELS_STYLE} from './constants';
import type {PreparedLegend, PreparedSeries, PreparedWaterfallSeries} from './types';
import {prepareLegendSymbol} from './utils';

type PrepareWaterfallSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: WaterfallSeries[];
    legend: PreparedLegend;
};

export function prepareWaterfallSeries(args: PrepareWaterfallSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, legend} = args;
    const [_totalsColor, negativeColor, positiveColor] = DEFAULT_PALETTE;

    return seriesList.map<PreparedWaterfallSeries>((series) => {
        const name = series.name || '';
        const color = series.color || colorScale(name);

        const prepared: PreparedWaterfallSeries = {
            type: series.type,
            color,
            positiveColor: positiveColor,
            negativeColor: negativeColor,
            name,
            id: getRandomCKId(),
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            data: series.data,
            dataLabels: {
                enabled: series.dataLabels?.enabled || false,
                inside:
                    typeof series.dataLabels?.inside === 'boolean'
                        ? series.dataLabels?.inside
                        : false,
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
                allowOverlap: series.dataLabels?.allowOverlap || false,
                padding: get(series, 'dataLabels.padding', DEFAULT_DATALABELS_PADDING),
            },
            cursor: get(series, 'cursor', null),
        };
        return prepared;
    }, []);
}
