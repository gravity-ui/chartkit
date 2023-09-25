import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import type {ScaleOrdinal} from 'd3';
import {scaleOrdinal} from 'd3';

import type {
    BarXSeries,
    ChartKitWidgetSeries,
    PieSeries,
    RectLegendSymbolOptions,
} from '../../../../../types/widget-data';
import {getRandomCKId} from '../../../../../utils';
import {BaseTextStyle} from '../../../../../types/widget-data';

import {DEFAULT_PALETTE} from '../../constants';
import {DEFAULT_LEGEND_SYMBOL_SIZE} from './constants';
import type {
    PreparedBarXSeries,
    PreparedLegend,
    PreparedLegendSymbol,
    PreparedPieSeries,
    PreparedSeries,
} from './types';

const DEFAULT_DATALABELS_STYLE: BaseTextStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
};

function prepareLegendSymbol(series: ChartKitWidgetSeries): PreparedLegendSymbol {
    switch (series.type) {
        default: {
            const symbolOptions: RectLegendSymbolOptions = series.legend?.symbol || {};
            const symbolHeight = symbolOptions?.height || DEFAULT_LEGEND_SYMBOL_SIZE;

            return {
                shape: 'rect',
                width: symbolOptions?.width || DEFAULT_LEGEND_SYMBOL_SIZE,
                height: symbolHeight,
                radius: symbolOptions?.radius || symbolHeight / 2,
                padding: symbolOptions?.padding || 5,
            };
        }
    }
}

type PrepareAxisRelatedSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: ChartKitWidgetSeries;
    legend: PreparedLegend;
};

function prepareAxisRelatedSeries(args: PrepareAxisRelatedSeriesArgs): PreparedSeries[] {
    const {colorScale, series, legend} = args;
    const preparedSeries = cloneDeep(series) as PreparedSeries;
    const name = 'name' in series && series.name ? series.name : '';
    const color = 'color' in series && series.color ? series.color : colorScale(name);
    preparedSeries.color = color;
    preparedSeries.name = name;
    preparedSeries.visible = get(preparedSeries, 'visible', true);
    preparedSeries.legend = {
        enabled: get(preparedSeries, 'legend.enabled', legend.enabled),
        symbol: prepareLegendSymbol(series),
    };

    return [preparedSeries];
}

type PrepareBarXSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: BarXSeries[];
    legend: PreparedLegend;
};

function prepareBarXSeries(args: PrepareBarXSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, legend} = args;
    const commonStackId = getRandomCKId();

    return seriesList.map<PreparedBarXSeries>((series) => {
        const name = series.name || '';
        const color = series.color || colorScale(name);

        let stackId = series.stackId;
        if (!stackId) {
            stackId = series.stacking === 'normal' ? commonStackId : getRandomCKId();
        }

        return {
            type: series.type,
            color: color,
            name: name,
            id: '',
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            data: series.data,
            stacking: series.stacking,
            stackId,
            dataLabels: {
                enabled: series.dataLabels?.enabled || false,
                inside:
                    typeof series.dataLabels?.inside === 'boolean'
                        ? series.dataLabels?.inside
                        : false,
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
            },
        };
    }, []);
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
    legend: PreparedLegend;
    colorScale: ScaleOrdinal<string, string>;
}): PreparedSeries[] {
    const {type, series, legend, colorScale} = args;

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
        case 'scatter': {
            return series.reduce<PreparedSeries[]>((acc, singleSeries) => {
                acc.push(...prepareAxisRelatedSeries({series: singleSeries, legend, colorScale}));
                return acc;
            }, []);
        }
        default: {
            const seriesType = get(series, 'type');
            throw new Error(
                `Series type ${seriesType} does not support data preparation for series that do not support the presence of axes`,
            );
        }
    }
}
