import type {ScaleOrdinal} from 'd3';
import get from 'lodash/get';

import {LayoutAlgorithm} from '../../../../../constants';
import type {ChartKitWidgetSeriesOptions, TreemapSeries} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';

import {DEFAULT_DATALABELS_PADDING, DEFAULT_DATALABELS_STYLE} from './constants';
import type {PreparedLegend, PreparedTreemapSeries} from './types';
import {prepareLegendSymbol} from './utils';

type PrepareTreemapSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    legend: PreparedLegend;
    series: TreemapSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
};

export function prepareTreemap(args: PrepareTreemapSeriesArgs) {
    const {colorScale, legend, series} = args;

    return series.map<PreparedTreemapSeries>((s) => {
        const id = getRandomCKId();
        const name = s.name || '';
        const color = s.color || colorScale(name);

        const preparedSeries: PreparedTreemapSeries = {
            color,
            data: s.data,
            dataLabels: {
                enabled: get(s, 'dataLabels.enabled', true),
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, s.dataLabels?.style),
                padding: get(s, 'dataLabels.padding', DEFAULT_DATALABELS_PADDING),
                allowOverlap: get(s, 'dataLabels.allowOverlap', false),
                html: get(series, 'dataLabels.html', false),
            },
            id,
            type: s.type,
            name,
            visible: get(s, 'visible', true),
            legend: {
                enabled: get(s, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(s),
            },
            levels: s.levels,
            layoutAlgorithm: get(s, 'layoutAlgorithm', LayoutAlgorithm.Binary),
            cursor: get(s, 'cursor', null),
        };

        return preparedSeries;
    });
}
