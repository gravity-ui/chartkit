import {LayoutAlgorithm, SeriesType} from '../../constants';
import type {BaseSeries, BaseSeriesData} from './base';
import {ChartKitWidgetLegend, RectLegendSymbolOptions} from './legend';

export type TreemapSeriesData<T = any> = BaseSeriesData<T> & {
    /** The name of the point (used in legend, tooltip etc). */
    name: string;
    /**
     * The value of the point.
     *
     * Note: don't set this value for node with children, еhis may lead to incorrect chart display.
     * */
    value?: number;
    /** Initial visibility of the point. */
    visible?: boolean;
    /** An id for the point. Used to group child points. */
    id?: string;
    /**
     * Parent id. Used to build a tree structure. The value should be the id of the point which is the parent.
     * If no points has a matching id, or this option is undefined, then the parent will be set to the root.
     */
    parent?: string;
};

export type TreemapSeries<T = any> = BaseSeries & {
    type: typeof SeriesType.Treemap;
    data: TreemapSeriesData<T>[];
    /** The name of the series (used in legend, tooltip etc). */
    name: string;
    /** The main color of the series (hex, rgba). */
    color?: string;
    /** Individual series legend options. Has higher priority than legend options in widget data. */
    legend?: ChartKitWidgetLegend & {
        symbol?: RectLegendSymbolOptions;
    };
    /** Set options on specific levels. Takes precedence over series options, but not point options. */
    levels?: {
        /** Decides which level takes effect from the options set in the levels object. */
        index: number;
        /** Can set the padding between all points which lies on the same level. */
        padding?: number;
        /** Can set a color on all points which lies on the same level. */
        color?: string;
    }[];
    layoutAlgorithm?: `${LayoutAlgorithm}`;
};
