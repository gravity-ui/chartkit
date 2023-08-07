import type React from 'react';

import type {FormatNumberOptions} from '../plugins/shared';

type BaseSeries = {
    /** Initial visibility of the series */
    visible?: boolean;
};

type BaseSeriesData<T = any> = {
    /**
     * A reserved subspace to store options and values for customized functionality
     *
     * Here you can add additional data for your own event callbacks and formatter callbacks
     */
    custom?: T;
};

export type BaseTextStyle = {
    fontSize: string;
};

export type ScatterSeriesData<T = any> = BaseSeriesData<T> & {
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

export type PieSeriesData<T = any> = BaseSeriesData<T> & {
    value: number;
    color: string;
    name: string;
};

export type PieSeries = BaseSeries & {
    type: 'pie';
    data: PieSeriesData[];
};

export type ChartKitWidgetSeries = ScatterSeries | PieSeries;

export type ChartKitWidgetSeriesData<T = any> = ScatterSeriesData<T> | PieSeriesData<T>;

export type ChartKitWidgetAxisType = 'category' | 'datetime' | 'linear';

export type ChartKitWidgetAxisLabels = {
    /** Enable or disable the axis labels */
    enabled?: boolean;
    /** The pixel padding for axis labels */
    padding?: number;
    dateFormat?: string;
    numberFormat?: FormatNumberOptions;
    style?: Partial<BaseTextStyle>;
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

type ChartKitWidgetTitle = {
    text: string;
    style?: Partial<BaseTextStyle>;
};

export type TooltipHoveredData<T = any> = {
    data: ChartKitWidgetSeriesData<T>;
    series: ChartKitWidgetSeries;
};

export type ChartKitWidgetData<T = any> = {
    chart?: {
        margin?: Partial<ChartMargin>;
    };
    legend?: ChartKitWidgetLegend;
    series: (ScatterSeries | PieSeries)[];
    title?: ChartKitWidgetTitle;
    tooltip?: {
        enabled?: boolean;
        renderer?: (data: {hovered: TooltipHoveredData<T>}) => React.ReactElement;
    };
    xAxis?: ChartKitWidgetAxis;
    yAxis?: ChartKitWidgetAxis[];
};
