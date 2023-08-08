import type {ChartKitWidgetSeries, ChartKitWidgetSeriesData} from './series';

export type TooltipHoveredData<T = any> = {
    data: ChartKitWidgetSeriesData<T>;
    series: ChartKitWidgetSeries;
};

export type ChartKitWidgetTooltip<T = any> = {
    enabled?: boolean;
    renderer?: (data: {hovered: TooltipHoveredData<T>}) => React.ReactElement;
};
