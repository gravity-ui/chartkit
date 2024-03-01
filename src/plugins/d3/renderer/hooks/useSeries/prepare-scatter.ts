import {ScaleOrdinal} from 'd3';
import get from 'lodash/get';
import merge from 'lodash/merge';

import type {ChartKitWidgetSeriesOptions, ScatterSeries} from '../../../../../types';
import {PointMarkerOptions} from '../../../../../types/widget-data/marker';
import {getRandomCKId} from '../../../../../utils';
import {getSymbolType} from '../../utils';

import {DEFAULT_HALO_OPTIONS, DEFAULT_POINT_MARKER_OPTIONS} from './constants';
import type {PreparedLegend, PreparedScatterSeries} from './types';
import {prepareLegendSymbol} from './utils';

function prepareMarker(
    series: ScatterSeries,
    seriesOptions: ChartKitWidgetSeriesOptions | undefined,
    index: number,
) {
    const seriesHoverState = get(seriesOptions, 'scatter.states.hover');
    const markerNormalState: Required<PointMarkerOptions> = {
        ...DEFAULT_POINT_MARKER_OPTIONS,
        enabled: true,
        symbol: (series as ScatterSeries).symbolType || getSymbolType(index),
    };

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

interface PrepareScatterSeriesArgs {
    colorScale: ScaleOrdinal<string, string>;
    series: ScatterSeries[];
    legend: PreparedLegend;
    seriesOptions?: ChartKitWidgetSeriesOptions;
}

export function prepareScatterSeries(args: PrepareScatterSeriesArgs): PreparedScatterSeries[] {
    const {colorScale, series, seriesOptions, legend} = args;

    return series.map<PreparedScatterSeries>((s, index) => {
        const id = getRandomCKId();
        const name = 'name' in s && s.name ? s.name : '';
        const symbolType = (s as ScatterSeries).symbolType || getSymbolType(index);

        const prepared: PreparedScatterSeries = {
            id,
            type: s.type,
            name,
            color: get(s, 'color', colorScale(name)),
            visible: get(s, 'visible', true),
            legend: {
                enabled: get(s, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(s, symbolType),
            },
            data: s.data,
            marker: prepareMarker(s, seriesOptions, index),
            cursor: get(s, 'cursor', null),
        };

        return prepared;
    }, []);
}
