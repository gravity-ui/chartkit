import {BaseSeries, BaseSeriesData} from './base';
import {ChartKitWidgetLegend, RectLegendSymbolOptions} from './legend';
import {PointMarkerOptions} from './marker';

export type LineSeriesData<T = any> = BaseSeriesData<T> & {
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
};

export type LineMarkerSymbol = 'circle' | 'square';

export type LineMarkerOptions = PointMarkerOptions & {
    symbol?: LineMarkerSymbol;
};

export type LineSeries<T = any> = BaseSeries & {
    type: 'line';
    data: LineSeriesData<T>[];
    /** The name of the series (used in legend, tooltip etc) */
    name: string;
    /** The main color of the series (hex, rgba) */
    color?: string;
    /** Pixel width of the graph line.
     *
     * @default 1
     * */
    lineWidth?: number;
    /** Individual series legend options. Has higher priority than legend options in widget data */
    legend?: ChartKitWidgetLegend & {
        symbol?: RectLegendSymbolOptions;
    };
    /** Options for the point markers of line series */
    marker?: LineMarkerOptions;
};
