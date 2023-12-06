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
    const seriesHoverState = get(seriesOptions, 'line.states.hover');

    return seriesList.map<PreparedLineSeries>((series) => {
        const id = getRandomCKId();
        const name = series.name || '';
        const color = series.color || colorScale(name);

        const markerNormalState = {
            enabled: get(
                series,
                'marker.enabled',
                get(seriesOptions, 'line.marker.enabled', false),
            ),
            symbol: get(
                series,
                'marker.symbol',
                get(seriesOptions, 'line.marker.symbol', 'circle'),
            ),
            radius: get(series, 'marker.radius', get(seriesOptions, 'line.marker.radius', 4)),
            borderWidth: get(
                series,
                'marker.borderWidth',
                get(seriesOptions, 'line.marker.borderWidth', 0),
            ),
            borderColor: get(
                series,
                'marker.borderColor',
                get(seriesOptions, 'line.marker.borderColor', ''),
            ),
        };

        const prepared: PreparedLineSeries = {
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
            marker: {
                states: {
                    normal: markerNormalState,
                    hover: {
                        enabled: get(seriesHoverState, 'marker.enabled', true),
                        radius: get(seriesHoverState, 'marker.radius', markerNormalState.radius),
                        borderWidth: get(seriesHoverState, 'marker.borderWidth', 1),
                        borderColor: get(seriesHoverState, 'marker.borderColor', '#ffffff'),
                        halo: {
                            enabled: get(seriesHoverState, 'marker.halo.enabled', true),
                            opacity: get(seriesHoverState, 'marker.halo.opacity', 0.25),
                            radius: get(seriesHoverState, 'marker.halo.radius', 10),
                        },
                    },
                },
            },
        };

        return prepared;
    }, []);
}
