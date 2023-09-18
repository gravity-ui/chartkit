import type {
    BaseTextStyle,
    ChartKitWidgetData,
    ChartKitWidgetAxis,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
    ChartMargin,
} from '../../../../../types/widget-data';

type PreparedAxisLabels = Omit<ChartKitWidgetAxisLabels, 'enabled' | 'padding' | 'style'> &
    Required<Pick<ChartKitWidgetAxisLabels, 'enabled' | 'padding' | 'distance'>> & {
        style: BaseTextStyle;
        maxWidth?: number;
    };

export type PreparedChart = {
    margin: ChartMargin;
};

export type PreparedAxis = Omit<ChartKitWidgetAxis, 'type' | 'labels'> & {
    type: ChartKitWidgetAxisType;
    labels: PreparedAxisLabels;
    title: {
        height: number;
        text: string;
        style: BaseTextStyle;
    };
    min?: number;
    grid: {
        enabled: boolean;
    };
    maxPadding: number;
    ticks: {
        pixelInterval?: number;
    };
};

export type PreparedTitle = ChartKitWidgetData['title'] & {
    height: number;
};

export type PreparedTooltip = ChartKitWidgetData['tooltip'] & {
    enabled: boolean;
};

export type ChartOptions = {
    chart: PreparedChart;
    tooltip: PreparedTooltip;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis[];
    title?: PreparedTitle;
};
