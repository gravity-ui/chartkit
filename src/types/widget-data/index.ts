import type {ChartKitWidgetAxis} from './axis';
import type {ChartKitWidgetChart} from './chart';
import type {ChartKitWidgetLegend} from './legend';
import type {ChartKitWidgetSeries, ChartKitWidgetSeriesOptions} from './series';
import type {ChartKitWidgetTitle} from './title';
import type {ChartKitWidgetTooltip} from './tooltip';

export * from './axis';
export * from './base';
export * from './chart';
export * from './legend';
export * from './pie';
export * from './scatter';
export * from './bar-x';
export * from './bar-y';
export * from './area';
export * from './line';
export * from './series';
export * from './title';
export * from './tooltip';
export * from './halo';
export * from './treemap';
export * from './waterfall';

export type ChartKitWidgetData<T = any> = {
    chart?: ChartKitWidgetChart;
    legend?: ChartKitWidgetLegend;
    series: {
        data: ChartKitWidgetSeries<T>[];
        options?: ChartKitWidgetSeriesOptions;
    };
    title?: ChartKitWidgetTitle;
    tooltip?: ChartKitWidgetTooltip<T>;
    xAxis?: ChartKitWidgetAxis;
    yAxis?: ChartKitWidgetAxis[];
};
