import type {BaseSeries, BaseSeriesData} from './base';
import type {ChartKitWidgetSeriesOptions} from './series';
import {ChartKitWidgetLegend, RectLegendSymbolOptions} from './legend';

export type BarXSeriesData<T = any> = BaseSeriesData<T> & {
    /** The x value of the point */
    x?: number;
    /** The y value of the point */
    y?: number;
    /** Corresponding value of axis category */
    category?: string;

    /** Data label value of the bar-x column. If not specified, the y value is used. */
    label?: string | number;
};

export type BarXSeries<T = any> = BaseSeries & {
    type: 'bar-x';
    data: BarXSeriesData<T>[];

    /** The name of the series (used in legend, tooltip etc) */
    name: string;

    /** The main color of the series (hex, rgba) */
    color?: string;

    // todo 'percent'
    /** Whether to stack the values of each series on top of each other.
     * Possible values are undefined to disable, "normal" to stack by value or "percent"
     *
     * @default undefined
     * */
    stacking?: 'normal' | 'percent';

    // todo
    /** This option allows grouping series in a stacked chart */
    stackId?: string;

    // todo
    /** Whether to group non-stacked columns or to let them render independent of each other.
     * When false columns will be laid out individually and overlap each other.
     *
     * @default true
     * */
    grouping?: boolean;

    dataLabels?: ChartKitWidgetSeriesOptions['dataLabels'] & {
        /**
         * Whether to align the data label inside or outside the box
         *
         * @default false
         * */
        inside?: boolean;
    };

    /** Individual series legend options. Has higher priority than legend options in widget data */
    legend?: ChartKitWidgetLegend & {
        symbol?: RectLegendSymbolOptions;
    };
};
