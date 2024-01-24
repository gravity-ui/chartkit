import {ScaleOrdinal} from 'd3';
import get from 'lodash/get';
import merge from 'lodash/merge';

import {DashStyle, LineCap} from '../../../../../constants';

import {
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesOptions,
    LineSeries,
    RectLegendSymbolOptions,
} from '../../../../../types';
import {PreparedLineSeries, PreparedLegend, PreparedLegendSymbol} from './types';

import {
    DEFAULT_DATALABELS_PADDING,
    DEFAULT_DATALABELS_STYLE,
    DEFAULT_HALO_OPTIONS,
    DEFAULT_LEGEND_SYMBOL_PADDING,
} from './constants';
import {getRandomCKId} from '../../../../../utils';

export const DEFAULT_LEGEND_SYMBOL_SIZE = 16;
export const DEFAULT_LINE_WIDTH = 1;
export const DEFAULT_DASH_STYLE = DashStyle.Solid;

export const DEFAULT_MARKER = {
    enabled: false,
    symbol: 'circle',
    radius: 4,
    borderWidth: 0,
    borderColor: '',
};

type PrepareLineSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: LineSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    legend: PreparedLegend;
};

function prepareLinecap(
    dashStyle: DashStyle,
    series: LineSeries,
    seriesOptions?: ChartKitWidgetSeriesOptions,
) {
    const defaultLineCap = dashStyle === DashStyle.Solid ? LineCap.Round : LineCap.None;
    const lineCapFromSeriesOptions = get(seriesOptions, 'line.linecap', defaultLineCap);

    return get(series, 'linecap', lineCapFromSeriesOptions);
}

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

function prepareMarker(series: LineSeries, seriesOptions?: ChartKitWidgetSeriesOptions) {
    const seriesHoverState = get(seriesOptions, 'line.states.hover');
    const markerNormalState = Object.assign(
        {},
        DEFAULT_MARKER,
        seriesOptions?.line?.marker,
        series.marker,
    );
    const hoveredMarkerDefaultOptions = {
        enabled: true,
        radius: markerNormalState.radius,
        borderWidth: 1,
        borderColor: '#ffffff',
        halo: DEFAULT_HALO_OPTIONS,
    };

    return {
        states: {
            normal: markerNormalState,
            hover: merge(hoveredMarkerDefaultOptions, seriesHoverState?.marker),
        },
    };
}

export function prepareLine(args: PrepareLineSeriesArgs) {
    const {colorScale, series: seriesList, seriesOptions, legend} = args;

    const defaultLineWidth = get(seriesOptions, 'line.lineWidth', DEFAULT_LINE_WIDTH);
    const defaultDashStyle = get(seriesOptions, 'line.dashStyle', DEFAULT_DASH_STYLE);

    return seriesList.map<PreparedLineSeries>((series) => {
        const id = getRandomCKId();
        const name = series.name || '';
        const color = series.color || colorScale(name);
        const dashStyle = get(series, 'dashStyle', defaultDashStyle);

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
            marker: prepareMarker(series, seriesOptions),
            dashStyle: dashStyle as DashStyle,
            linecap: prepareLinecap(dashStyle as DashStyle, series, seriesOptions) as LineCap,
        };

        return prepared;
    }, []);
}
