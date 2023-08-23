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
};
