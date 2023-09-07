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
    };
};
