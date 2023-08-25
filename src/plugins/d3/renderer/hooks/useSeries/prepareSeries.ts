import {scaleOrdinal, ScaleOrdinal} from 'd3';
import {
    ChartKitWidgetSeries,
    PieSeries,
    RectLegendSymbolOptions,
} from '../../../../../types/widget-data';
import {PreparedLegend} from '../useChartOptions/types';
import cloneDeep from 'lodash/cloneDeep';
import {PreparedLegendSymbol, PreparedPieSeries, PreparedSeries} from './types';
import get from 'lodash/get';
import {DEFAULT_PALETTE} from '../../constants';
import {DEFAULT_LEGEND_SYMBOL_SIZE} from './constants';

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

type PreparePieSeriesArgs = {
    series: PieSeries;
    legend: PreparedLegend;
};

function preparePieSeries(args: PreparePieSeriesArgs) {
    const {series, legend} = args;
    const dataNames = series.data.map((d) => d.name);
    const colorScale = scaleOrdinal(dataNames, DEFAULT_PALETTE);
    const randomKey = Math.random().toString();

    const preparedSeries: PreparedSeries[] = series.data.map<PreparedPieSeries>((dataItem) => {
        const preparedSeries: PreparedPieSeries = {
            type: 'pie',
            data: dataItem.value,
            visible: typeof dataItem.visible === 'boolean' ? dataItem.visible : true,
            name: dataItem.name,
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
            stackId: randomKey,
        };

        return preparedSeries;
    });

    return preparedSeries;
}

export function prepareSeries(args: {
    series: ChartKitWidgetSeries;
    legend: PreparedLegend;
    colorScale: ScaleOrdinal<string, string>;
}) {
    const {series, legend, colorScale} = args;

    switch (series.type) {
        case 'pie': {
            return preparePieSeries({series, legend});
        }
        case 'scatter':
        case 'bar-x': {
            return prepareAxisRelatedSeries({series, legend, colorScale});
        }
        default: {
            const seriesType = get(series, 'type');
            throw new Error(
                `Series type ${seriesType} does not support data preparation for series that do not support the presence of axes`,
            );
        }
    }
}
