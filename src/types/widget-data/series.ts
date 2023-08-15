import type {PieSeries, PieSeriesData} from './pie';
import type {ScatterSeries, ScatterSeriesData} from './scatter';

export type ChartKitWidgetSeries<T = any> = ScatterSeries<T> | PieSeries<T>;

export type ChartKitWidgetSeriesData<T = any> = ScatterSeriesData<T> | PieSeriesData<T>;
