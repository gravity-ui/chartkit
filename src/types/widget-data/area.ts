import {SeriesType} from '../../constants';
import type {BaseSeries, BaseSeriesData} from './base';
import type {ChartKitWidgetLegend, RectLegendSymbolOptions} from './legend';
import type {PointMarkerOptions} from './marker';

export type AreaSeriesData<T = any> = BaseSeriesData<T> & {
    /**
     * The `x` value of the point. Depending on the context , it may represents:
     * - numeric value (for `linear` x axis)
     * - timestamp value (for `datetime` x axis)
     * - x axis category value (for `category` x axis). If the type is a string, then it is a category value itself. If the type is a number, then it is the index of an element in the array of categories described in `xAxis.categories`
     */
    x?: string | number;
    /**
     * The `y` value of the point. Depending on the context , it may represents:
     * - numeric value (for `linear` y axis)
     * - timestamp value (for `datetime` y axis)
     * - y axis category value (for `category` y axis). If the type is a string, then it is a category value itself. If the type is a number, then it is the index of an element in the array of categories described in `yAxis[0].categories`
     */
    y?: string | number;
    /** Data label value of the point. If not specified, the y value is used. */
    label?: string | number;
    /** Individual marker options for the point. */
    marker?: {
        /** States for a single point marker. */
        states?: {
            /** The normal state of a single point marker. */
            normal?: {
                /**
                 * Enable or disable the point marker.
                 *
                 * @default false
                 * */
                enabled: boolean;
            };
        };
    };
};

export type AreaMarkerSymbol = 'circle' | 'square';

export type AreaMarkerOptions = PointMarkerOptions & {
    symbol?: AreaMarkerSymbol;
};

export type AreaSeries<T = any> = BaseSeries & {
    type: typeof SeriesType.Area;
    data: AreaSeriesData<T>[];
    /** The name of the series (used in legend, tooltip etc) */
    name: string;
    /** Whether to stack the values of each series on top of each other.
     * Possible values are undefined to disable, "normal" to stack by value or "percent"
     *
     * @default undefined
     * */
    stacking?: 'normal' | 'percent';
    /** This option allows grouping series in a stacked chart */
    stackId?: string;
    /** The main color of the series (hex, rgba) */
    color?: string;
    /** Fill opacity for the area
     *
     * @default 0.75
     * */
    opacity?: number;
    /** Pixel width of the graph line.
     *
     * @default 1
     * */
    lineWidth?: number;
    /** Individual series legend options. Has higher priority than legend options in widget data */
    legend?: ChartKitWidgetLegend & {
        symbol?: RectLegendSymbolOptions;
    };
    /** Options for the point markers of line in area series */
    marker?: AreaMarkerOptions;
};
