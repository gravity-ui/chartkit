import {ScaleOrdinal} from 'd3';
import get from 'lodash/get';

import {ChartKitWidgetSeriesOptions, LineSeries} from '../../../../../types';
import {PreparedLineSeries, PreparedLegend, PreparedSeries} from './types';

import {DEFAULT_DATALABELS_STYLE} from './constants';
import {prepareLegendSymbol} from './utils';

type PrepareLineSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: LineSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    legend: PreparedLegend;
};

export function prepareLineSeries(args: PrepareLineSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, seriesOptions, legend} = args;
    const defaultLineWidth = get(seriesOptions, 'line.lineWidth', 1);

    return seriesList.map<PreparedLineSeries>((series) => {
        const name = series.name || '';
        const color = series.color || colorScale(name);

        return {
            type: series.type,
            color: color,
            lineWidth: get(series, 'lineWidth', defaultLineWidth),
            name: name,
            id: '',
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            data: series.data,
            dataLabels: {
                enabled: series.dataLabels?.enabled || false,
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
            },
        };
    }, []);
}
