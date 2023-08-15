import type {PieSeries, PieSeriesData} from './pie';
import type {ScatterSeries, ScatterSeriesData} from './scatter';
import type {BarSeries, BarSeriesData} from './bar';

export type ChartKitWidgetSeries<T = any> = ScatterSeries<T> | PieSeries<T> | BarSeries<T>;

export type ChartKitWidgetSeriesData<T = any> =
    | ScatterSeriesData<T>
    | PieSeriesData<T>
    | BarSeriesData<T>;
