import {ScaleOrdinal} from 'd3';
import get from 'lodash/get';

import {
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesOptions,
    LineSeries,
    RectLegendSymbolOptions,
} from '../../../../../types';
import {PreparedLineSeries, PreparedLegend, PreparedSeries, PreparedLegendSymbol} from './types';

import {
    DEFAULT_DATALABELS_PADDING,
    DEFAULT_DATALABELS_STYLE,
    DEFAULT_LEGEND_SYMBOL_PADDING,
} from './constants';
import {getRandomCKId} from '../../../../../utils';

export const DEFAULT_LEGEND_SYMBOL_SIZE = 16;
export const DEFAULT_LINE_WIDTH = 1;

type PrepareLineSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: LineSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    legend: PreparedLegend;
};

function prepareLineLegendSymbol(
    series: ChartKitWidgetSeries,
    seriesOptions?: ChartKitWidgetSeriesOptions,
): PreparedLegendSymbol {
    const symbolOptions: RectLegendSymbolOptions = series.legend?.symbol || {};
    const defaultLineWidth = get(seriesOptions, 'line.lineWidth', DEFAULT_LINE_WIDTH);

    return {
        shape: 'path',
        width: symbolOptions?.width || DEFAULT_LEGEND_SYMBOL_SIZE,
        padding: symbolOptions?.padding || DEFAULT_LEGEND_SYMBOL_PADDING,
        strokeWidth: get(series, 'lineWidth', defaultLineWidth),
    };
}

export function prepareLineSeries(args: PrepareLineSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, seriesOptions, legend} = args;
    const defaultLineWidth = get(seriesOptions, 'line.lineWidth', DEFAULT_LINE_WIDTH);

    return seriesList.map<PreparedLineSeries>((series) => {
        const id = getRandomCKId();
        const name = series.name || '';
        const color = series.color || colorScale(name);

        return {
            type: series.type,
            color,
            lineWidth: get(series, 'lineWidth', defaultLineWidth),
            name,
            id,
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLineLegendSymbol(series, seriesOptions),
            },
            data: series.data,
            dataLabels: {
                enabled: series.dataLabels?.enabled || false,
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
                padding: get(series, 'dataLabels.padding', DEFAULT_DATALABELS_PADDING),
                allowOverlap: get(series, 'dataLabels.allowOverlap', false),
            },
        };
    }, []);
}
