import type {ScaleOrdinal} from 'd3';

import {ChartKitError} from '../../../../../libs';
import type {
    AreaSeries,
    BarXSeries,
    BarYSeries,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesOptions,
    LineSeries,
    PieSeries,
    ScatterSeries,
    TreemapSeries,
    WaterfallSeries,
} from '../../../../../types';

import {prepareArea} from './prepare-area';
import {prepareBarXSeries} from './prepare-bar-x';
import {prepareBarYSeries} from './prepare-bar-y';
import {prepareLineSeries} from './prepare-line';
import {preparePieSeries} from './prepare-pie';
import {prepareScatterSeries} from './prepare-scatter';
import {prepareTreemap} from './prepare-treemap';
import {prepareWaterfallSeries} from './prepare-waterfall';
import type {PreparedLegend, PreparedSeries} from './types';

export function prepareSeries(args: {
    type: ChartKitWidgetSeries['type'];
    series: ChartKitWidgetSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    legend: PreparedLegend;
    colorScale: ScaleOrdinal<string, string>;
}): PreparedSeries[] {
    const {type, series, seriesOptions, legend, colorScale} = args;

    switch (type) {
        case 'pie': {
            return series.reduce<PreparedSeries[]>((acc, singleSeries) => {
                acc.push(
                    ...preparePieSeries({series: singleSeries as PieSeries, seriesOptions, legend}),
                );
                return acc;
            }, []);
        }
        case 'bar-x': {
            return prepareBarXSeries({series: series as BarXSeries[], legend, colorScale});
        }
        case 'bar-y': {
            return prepareBarYSeries({series: series as BarYSeries[], legend, colorScale});
        }
        case 'scatter': {
            return prepareScatterSeries({series: series as ScatterSeries[], legend, colorScale});
        }
        case 'line': {
            return prepareLineSeries({
                series: series as LineSeries[],
                seriesOptions,
                legend,
                colorScale,
            });
        }
        case 'area': {
            return prepareArea({
                series: series as AreaSeries[],
                seriesOptions,
                legend,
                colorScale,
            });
        }
        case 'treemap': {
            return prepareTreemap({
                series: series as TreemapSeries[],
                seriesOptions,
                legend,
                colorScale,
            });
        }
        case 'waterfall': {
            return prepareWaterfallSeries({
                series: series as WaterfallSeries[],
                legend,
                colorScale,
            });
        }
        default: {
            throw new ChartKitError({
                message: `Series type "${type}" does not support data preparation for series that do not support the presence of axes`,
            });
        }
    }
}
