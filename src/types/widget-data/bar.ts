import type {BaseSeries, BaseSeriesData} from './base';

export type BarSeriesData<T = any> = BaseSeriesData<T> & {
    /** The x value of the point */
    x?: number;
    /** The y value of the point */
    y?: number;
    /** Corresponding value of axis category */
    category?: string;
};

export type BarSeries<T = any> = BaseSeries & {
    type: 'bar';
    data: BarSeriesData<T>[];
    /** The name of the series (used in legend) */
    name: string;
    /** The main color of the series (hex, rgba) */
    color?: string;
};
