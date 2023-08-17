import type {BaseSeries, BaseSeriesData} from './base';
import type {ChartKitWidgetSeriesOptions} from './series';

export type BarXSeriesData<T = any> = BaseSeriesData<T> & {
    /** The x value of the point */
    x?: number;
    /** The y value of the point */
    y?: number;
    /** Corresponding value of axis category */
    category?: string;
};

export type BarXSeries<T = any> = BaseSeries & {
    type: 'bar-x';
    data: BarXSeriesData<T>[];

    /** The name of the series (used in legend) */
    name: string;

    /** The main color of the series (hex, rgba) */
    color?: string;

    // todo
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
        /** Whether to align the data label inside the box or to the actual value point */
        inside?: boolean;
    };
};
