import type {BaseSeries, BaseSeriesData} from './base';

export type ScatterSeriesData<T = any> = BaseSeriesData<T> & {
    /** The x value of the point */
    x?: number;
    /** The y value of the point */
    y?: number;
    /** Corresponding value of axis category */
    category?: string;
    radius?: number;
};

export type ScatterSeries<T = any> = BaseSeries & {
    type: 'scatter';
    data: ScatterSeriesData<T>[];
    /** The name of the series (used in legend, tooltip etc) */
    name: string;
    /** The main color of the series (hex, rgba) */
    color?: string;
    /** A predefined shape or symbol for the dot */
    symbol?: string;
    // yAxisIndex?: number;
};
