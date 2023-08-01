import type {FormatNumberOptions} from '../plugins/shared';

type BaseSeries = {
    /** Initial visibility of the series */
    visible?: boolean;
};

export type ScatterSeriesData = {
    /** The x value of the point */
    x?: number;
    /** The y value of the point */
    y?: number;
    /** Corresponding value of axis category */
    category?: string;
    radius?: number;
};

export type ScatterSeries = BaseSeries & {
    type: 'scatter';
    data: ScatterSeriesData[];
    /** The name of the series (used in legend) */
    name: string;
    /** The main color of the series (hex, rgba) */
    color?: string;
    /** A predefined shape or symbol for the dot */
    symbol?: string;
    yAxisIndex?: number;
    /** Initial visibility of the series */
    visible?: boolean;
};

export type PieSeriesData = {
    value: number;
    color: string;
    name: string;
};

export type PieSeries = BaseSeries & {
    type: 'pie';
    data: PieSeriesData[];
};

export type ChartKitWidgetSeries = ScatterSeries | PieSeries;

export type ChartKitWidgetAxisType = 'category' | 'datetime' | 'linear';

export type ChartKitWidgetAxisLabels = {
    /** Enable or disable the axis labels */
    enabled?: boolean;
    /** The pixel padding for axis labels */
    padding?: number;
    dateFormat?: string;
    numberFormat?: FormatNumberOptions;
    style?: {
        fontSize?: string;
    };
};

export type ChartKitWidgetAxis = {
    categories?: string[];
    timestamps?: number[];
    type?: ChartKitWidgetAxisType;
    /** The axis labels show the number or category for each tick */
    labels?: ChartKitWidgetAxisLabels;
};

export type ChartMargin = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

export type ChartKitWidgetLegend = {
    enabled?: boolean;
};

export type ChartKitWidgetData = {
    chart?: {
        margin?: Partial<ChartMargin>;
    };
    legend?: ChartKitWidgetLegend;
    series: (ScatterSeries | PieSeries)[];
    tooltip?: {
        enabled?: boolean;
    };
    xAxis?: ChartKitWidgetAxis;
    yAxis?: ChartKitWidgetAxis[];
};
