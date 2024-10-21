import {LayoutAlgorithm, SeriesType} from '../../constants';

import type {BaseSeries, BaseSeriesData} from './base';
import {ChartKitWidgetLegend, RectLegendSymbolOptions} from './legend';

export type TreemapSeriesData<T = any> = BaseSeriesData<T> & {
    /** The name of the node (used in legend, tooltip etc). */
    name: string | string[];
    /** The value of the node. All nodes should have this property except nodes that have children. */
    value?: number;
    /** An id for the node. Used to group children. */
    id?: string;
    /**
     * Parent id. Used to build a tree structure. The value should be the id of the node which is the parent.
     * If no nodes has a matching id, or this option is undefined, then the parent will be set to the root.
     */
    parentId?: string;
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
    /**
     * Options for the series data labels, appearing next to each data point.
     * */
    dataLabels?: BaseSeries['dataLabels'] & {
        /** Horizontal alignment of the data label inside the tile. */
        align?: 'left' | 'center' | 'right';
    };
};
