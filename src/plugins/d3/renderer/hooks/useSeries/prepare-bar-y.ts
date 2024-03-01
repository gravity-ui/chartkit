import type {ScaleOrdinal} from 'd3';
import get from 'lodash/get';

import type {BarYSeries} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';
import {getLabelsSize} from '../../utils';

import {DEFAULT_DATALABELS_STYLE} from './constants';
import type {PreparedBarYSeries, PreparedLegend, PreparedSeries} from './types';
import {getSeriesStackId, prepareLegendSymbol} from './utils';

type PrepareBarYSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: BarYSeries[];
    legend: PreparedLegend;
};

function prepareDataLabels(series: BarYSeries) {
    const enabled = get(series, 'dataLabels.enabled', false);
    const style = Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style);
    const {maxHeight = 0, maxWidth = 0} = enabled
        ? getLabelsSize({
              labels: series.data.map((d) => String(d.label || d.x)),
              style,
          })
        : {};

    return {
        enabled,
        inside: get(series, 'dataLabels.inside', false),
        style,
        maxHeight,
        maxWidth,
    };
}

export function prepareBarYSeries(args: PrepareBarYSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, legend} = args;

    return seriesList.map<PreparedBarYSeries>((series) => {
        const name = series.name || '';
        const color = series.color || colorScale(name);

        return {
            type: series.type,
            color,
            name,
            id: getRandomCKId(),
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            data: series.data,
            stacking: series.stacking,
            stackId: getSeriesStackId(series),
            dataLabels: prepareDataLabels(series),
            cursor: get(series, 'cursor', null),
        };
    }, []);
}
