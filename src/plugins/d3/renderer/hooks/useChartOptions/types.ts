import type {
    BaseTextStyle,
    ChartKitWidgetData,
    ChartKitWidgetAxis,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
    ChartKitWidgetLegend,
    ChartMargin,
} from '../../../../../types/widget-data';

type PreparedAxisLabels = Omit<ChartKitWidgetAxisLabels, 'enabled' | 'padding' | 'style'> &
    Required<Pick<ChartKitWidgetAxisLabels, 'enabled' | 'padding'>> & {
        style: BaseTextStyle;
    };

export type PreparedChart = {
    margin: ChartMargin;
};

export type PreparedLegend = Required<ChartKitWidgetLegend>;

export type PreparedAxis = Omit<ChartKitWidgetAxis, 'type' | 'labels'> & {
    type: ChartKitWidgetAxisType;
    labels: PreparedAxisLabels;
};

export type PreparedTitle = ChartKitWidgetData['title'] & {
    height: number;
};

export type PreparedTooltip = ChartKitWidgetData['tooltip'] & {
    enabled: boolean;
};

export type ChartOptions = {
    chart: PreparedChart;
    legend: PreparedLegend;
    tooltip: PreparedTooltip;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis[];
    title?: PreparedTitle;
};
