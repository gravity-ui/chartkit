import {ScaleOrdinal} from 'd3';
import get from 'lodash/get';
import merge from 'lodash/merge';
import type {PreparedLegend, PreparedScatterSeries} from './types';
import type {ChartKitWidgetSeriesOptions, ScatterSeries} from '../../../../../types';
import {getSymbolType} from '../../utils';
import {SymbolType} from '../../../../../constants';

import {prepareLegendSymbol} from './utils';
import {DEFAULT_HALO_OPTIONS} from './constants';

import {PointMarkerOptions} from '../../../../../types/widget-data/marker';
import {getRandomCKId} from '../../../../../utils';

function prepareMarker(
    series: ScatterSeries,
    seriesOptions: ChartKitWidgetSeriesOptions | undefined,
    index: number,
) {
    const seriesHoverState = get(seriesOptions, 'scatter.states.hover');
    const markerNormalState: Required<PointMarkerOptions> = {
        enabled: true,
        radius: 4,
        borderColor: '',
        borderWidth: 0,
        symbol: ((series as ScatterSeries).symbolType || getSymbolType(index)) as SymbolType,
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
        const symbolType = ((s as ScatterSeries).symbolType || getSymbolType(index)) as SymbolType;

        const prepared: PreparedScatterSeries = {
            id,
            type: s.type,
            name,
            symbolType,
            color: get(s, 'color', colorScale(name)),
            visible: get(s, 'visible', true),
            legend: {
                enabled: get(s, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(s, symbolType),
            },
            data: s.data,
            marker: prepareMarker(s, seriesOptions, index),
        };

        return prepared;
    }, []);
}
