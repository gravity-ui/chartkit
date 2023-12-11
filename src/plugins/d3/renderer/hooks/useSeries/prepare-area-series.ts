import {ScaleOrdinal} from 'd3';
import get from 'lodash/get';
import merge from 'lodash/merge';

import {ChartKitWidgetSeriesOptions, AreaSeries} from '../../../../../types';
import {PreparedAreaSeries, PreparedLegend} from './types';

import {DEFAULT_DATALABELS_PADDING, DEFAULT_DATALABELS_STYLE} from './constants';
import {getRandomCKId} from '../../../../../utils';
import {prepareLegendSymbol} from './utils';

export const DEFAULT_LINE_WIDTH = 1;

export const DEFAULT_MARKER = {
    enabled: false,
    symbol: 'circle',
    radius: 4,
    borderWidth: 0,
    borderColor: '',
};

type PrepareAreaSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: AreaSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    legend: PreparedLegend;
};

function prepareMarker(series: AreaSeries, seriesOptions?: ChartKitWidgetSeriesOptions) {
    const seriesHoverState = get(seriesOptions, 'area.states.hover');
    const markerNormalState = Object.assign(
        {},
        DEFAULT_MARKER,
        seriesOptions?.area?.marker,
        series.marker,
    );
    const hoveredMarkerDefaultOptions = {
        enabled: true,
        radius: markerNormalState.radius,
        borderWidth: 1,
        borderColor: '#ffffff',
        halo: {
            enabled: true,
            opacity: 0.25,
            radius: 10,
        },
    };

    return {
        states: {
            normal: markerNormalState,
            hover: merge(hoveredMarkerDefaultOptions, seriesHoverState?.marker),
        },
    };
}

export function prepareAreaSeries(args: PrepareAreaSeriesArgs) {
    const {colorScale, series: seriesList, seriesOptions, legend} = args;
    const defaultAreaWidth = get(seriesOptions, 'area.lineWidth', DEFAULT_LINE_WIDTH);

    return seriesList.map<PreparedAreaSeries>((series) => {
        const id = getRandomCKId();
        const name = series.name || '';
        const color = series.color || colorScale(name);

        const prepared: PreparedAreaSeries = {
            type: series.type,
            color,
            lineWidth: get(series, 'lineWidth', defaultAreaWidth),
            name,
            id,
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            data: series.data,
            dataLabels: {
                enabled: series.dataLabels?.enabled || false,
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
                padding: get(series, 'dataLabels.padding', DEFAULT_DATALABELS_PADDING),
                allowOverlap: get(series, 'dataLabels.allowOverlap', false),
            },
            marker: prepareMarker(series, seriesOptions),
        };

        return prepared;
    }, []);
}
