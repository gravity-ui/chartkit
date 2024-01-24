import type {ScaleOrdinal} from 'd3';

import type {
    AreaSeries,
    BarXSeries,
    BarYSeries,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesOptions,
    LineSeries,
    PieSeries,
    ScatterSeries,
} from '../../../../../types';

import type {PreparedLegend, PreparedSeries} from './types';
import {prepareLine} from './prepare-line';
import {prepareBarXSeries} from './prepare-bar-x';
import {prepareBarYSeries} from './prepare-bar-y';
import {ChartKitError} from '../../../../../libs';
import {preparePieSeries} from './prepare-pie';
import {prepareArea} from './prepare-area';
import {prepareScatterSeries} from './prepare-scatter';

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
            return prepareLine({
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
        default: {
            throw new ChartKitError({
                message: `Series type "${type}" does not support data preparation for series that do not support the presence of axes`,
            });
        }
    }
}
