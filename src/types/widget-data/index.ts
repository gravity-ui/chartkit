import type {ChartKitWidgetAxis} from './axis';
import type {ChartKitWidgetChart} from './chart';
import type {ChartKitWidgetLegend} from './legend';
import type {ChartKitWidgetSeries} from './series';
import type {ChartKitWidgetTitle} from './title';
import type {ChartKitWidgetTooltip} from './tooltip';

export * from './axis';
export * from './base';
export * from './chart';
export * from './legend';
export * from './pie';
export * from './scatter';
export * from './bar';
export * from './series';
export * from './title';
export * from './tooltip';

export type ChartKitWidgetData<T = any> = {
    chart?: ChartKitWidgetChart;
    legend?: ChartKitWidgetLegend;
    series: ChartKitWidgetSeries<T>[];
    title?: ChartKitWidgetTitle;
    tooltip?: ChartKitWidgetTooltip<T>;
    xAxis?: ChartKitWidgetAxis;
    yAxis?: ChartKitWidgetAxis[];
};
