import type {PieSeries, PieSeriesData} from './pie';
import type {ScatterSeries, ScatterSeriesData} from './scatter';
import type {BarXSeries, BarXSeriesData} from './bar-x';
import React from 'react';

export type ChartKitWidgetSeries<T = any> = ScatterSeries<T> | PieSeries<T> | BarXSeries<T>;

export type ChartKitWidgetSeriesData<T = any> =
    | ScatterSeriesData<T>
    | PieSeriesData<T>
    | BarXSeriesData<T>;

export type DataLabelRendererData<T = any> = {
    data: ChartKitWidgetSeriesData<T>;
};

type BasicHoverState = {
    /**
     * Enable separate styles for the hovered series.
     *
     * @default true
     * */
    enabled?: boolean;
    /**
     * How much to brighten/darken the point on hover. Use positive to brighten, negative to darken.
     * The behavior of this property is dependent on the implementing color space ([more details](https://d3js.org/d3-color#color_brighter)).
     * For example in case of using rgb color you can use floating point number from `-5.0` to `5.0`.
     * Rgb color space is used by default.
     *
     * @default 0.3
     */
    brightness?: number;
};

type BasicInactiveState = {
    /**
     * Enable separate styles for the inactive series.
     *
     * @default true
     * */
    enabled?: boolean;
    /**
     * Opacity of series elements (bars, data labels)
     *
     * @default 0.5
     * */
    opacity?: number;
};

export type ChartKitWidgetSeriesOptions = {
    // todo
    /** Individual data label for each point. */
    dataLabels?: {
        /** Enable or disable the data labels */
        enabled?: boolean;
        /** Callback function to render the data label */
        renderer?: (args: DataLabelRendererData) => React.SVGTextElementAttributes<SVGTextElement>;
    };
    'bar-x'?: {
        /** The maximum allowed pixel width for a column.
         * This prevents the columns from becoming too wide when there is a small number of points in the chart.
         *
         * @default 50
         */
        barMaxWidth?: number;
        /** Padding between each column or bar, in x axis units.
         *
         * @default 0.1
         * */
        barPadding?: number;
        /** Padding between each value groups, in x axis units
         *
         * @default 0.2
         */
        groupPadding?: number;
        dataSorting?: {
            /** Determines what data value should be used to sort by.
             * Possible values are undefined to disable, "name" to sort by series name or "y"
             *
             * @default undefined
             * */
            key?: 'name' | 'y' | undefined;
            /** Sorting direction.
             *
             * @default 'asc'
             * */
            direction?: 'asc' | 'desc';
        };
        /** Options for the series states that provide additional styling information to the series. */
        states?: {
            hover?: BasicHoverState;
            inactive?: BasicInactiveState;
        };
    };
    pie?: {
        /** Options for the series states that provide additional styling information to the series. */
        states?: {
            hover?: BasicHoverState;
            inactive?: BasicInactiveState;
        };
    };
    scatter?: {
        /** Options for the series states that provide additional styling information to the series. */
        states?: {
            hover?: BasicHoverState;
            inactive?: BasicInactiveState;
        };
    };
};
