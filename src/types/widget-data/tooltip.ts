import type {ChartKitWidgetSeries, ChartKitWidgetSeriesData} from './series';

export type TooltipHoveredData<T = any> = {
    data: ChartKitWidgetSeriesData<T>;
    series: ChartKitWidgetSeries;
};

export type ChartKitWidgetTooltip<T = any> = {
    enabled?: boolean;
    /** Specifies the renderer for the tooltip. If returned null default tooltip renderer will be used. */
    renderer?: (data: {hovered: TooltipHoveredData<T>}) => React.ReactElement;
};
