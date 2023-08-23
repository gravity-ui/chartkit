import type {BaseSeries, BaseSeriesData} from './base';

export type PieSeriesData<T = any> = BaseSeriesData<T> & {
    value: number;
    color: string;
    name: string;
};

export type PieSeries<T = any> = BaseSeries & {
    type: 'pie';
    data: PieSeriesData<T>[];
};
