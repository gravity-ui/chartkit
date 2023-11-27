import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import type {ScaleOrdinal} from 'd3';

import type {
    BarXSeries,
    BarYSeries,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesOptions,
    LineSeries,
    PieSeries,
} from '../../../../../types';

import type {PreparedLegend, PreparedSeries} from './types';
import {prepareLineSeries} from './prepare-line-series';
import {prepareBarXSeries} from './prepare-bar-x';
import {prepareBarYSeries} from './prepare-bar-y';
import {prepareLegendSymbol} from './utils';
import {ChartKitError} from '../../../../../libs';
import {preparePieSeries} from './prepare-pie';

type PrepareAxisRelatedSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: ChartKitWidgetSeries;
    legend: PreparedLegend;
};

function prepareAxisRelatedSeries(args: PrepareAxisRelatedSeriesArgs): PreparedSeries[] {
    const {colorScale, series, legend} = args;
    const preparedSeries = cloneDeep(series) as PreparedSeries;
    const name = 'name' in series && series.name ? series.name : '';
    preparedSeries.color = 'color' in series && series.color ? series.color : colorScale(name);
    preparedSeries.name = name;
    preparedSeries.visible = get(preparedSeries, 'visible', true);
    preparedSeries.legend = {
        enabled: get(preparedSeries, 'legend.enabled', legend.enabled),
        symbol: prepareLegendSymbol(series),
    };

    return [preparedSeries];
}

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
                acc.push(...preparePieSeries({series: singleSeries as PieSeries, legend}));
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
            return series.reduce<PreparedSeries[]>((acc, singleSeries) => {
                acc.push(...prepareAxisRelatedSeries({series: singleSeries, legend, colorScale}));
                return acc;
            }, []);
        }
        case 'line': {
            return prepareLineSeries({
                series: series as LineSeries[],
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
