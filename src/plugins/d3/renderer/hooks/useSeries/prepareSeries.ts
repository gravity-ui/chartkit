import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import type {ScaleOrdinal} from 'd3';
import {scaleOrdinal} from 'd3';

import type {
    BarXSeries,
    BarYSeries,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesOptions,
    LineSeries,
    PieSeries,
} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';

import {DEFAULT_PALETTE} from '../../constants';
import type {PreparedLegend, PreparedPieSeries, PreparedSeries} from './types';
import {prepareLineSeries} from './prepare-line-series';
import {prepareBarXSeries} from './prepare-bar-x';
import {prepareBarYSeries} from './prepare-bar-y';
import {prepareLegendSymbol} from './utils';
import {ChartKitError} from '../../../../../libs';
import {DEFAULT_DATALABELS_PADDING, DEFAULT_DATALABELS_STYLE} from './constants';

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

type PreparePieSeriesArgs = {
    series: PieSeries;
    legend: PreparedLegend;
};

function preparePieSeries(args: PreparePieSeriesArgs) {
    const {series, legend} = args;
    const dataNames = series.data.map((d) => d.name);
    const colorScale = scaleOrdinal(dataNames, DEFAULT_PALETTE);
    const stackId = getRandomCKId();

    const preparedSeries: PreparedSeries[] = series.data.map<PreparedPieSeries>((dataItem) => {
        const result: PreparedPieSeries = {
            type: 'pie',
            data: dataItem,
            dataLabels: {
                enabled: get(series, 'dataLabels.enabled', true),
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
                padding: get(series, 'dataLabels.padding', DEFAULT_DATALABELS_PADDING),
                allowOverlap: get(series, 'dataLabels.allowOverlap', false),
                connectorPadding: get(series, 'dataLabels.connectorPadding', 5),
                connectorShape: get(series, 'dataLabels.connectorShape', 'polyline'),
                distance: get(series, 'dataLabels.distance', 30),
                softConnector: get(series, 'dataLabels.softConnector', true),
            },
            label: dataItem.label,
            value: dataItem.value,
            visible: typeof dataItem.visible === 'boolean' ? dataItem.visible : true,
            name: dataItem.name,
            id: '',
            color: dataItem.color || colorScale(dataItem.name),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            center: series.center || ['50%', '50%'],
            borderColor: series.borderColor || '',
            borderRadius: series.borderRadius ?? 0,
            borderWidth: series.borderWidth ?? 1,
            radius: series.radius || '100%',
            innerRadius: series.innerRadius || 0,
            stackId,
        };

        return result;
    });

    return preparedSeries;
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
