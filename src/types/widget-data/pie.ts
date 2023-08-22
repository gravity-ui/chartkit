import type {BaseSeries, BaseSeriesData} from './base';

export type PieSeriesData<T = any> = BaseSeriesData<T> & {
    /** The value of the pie segment. */
    value: number;
    /** The name of the pie segment (used in legend, tooltip etc). */
    name: string;
    /** Individual color for the pie segment. */
    color?: string;
    /** Initial visibility of the pie segment. */
    visible?: boolean;
};

export type PieSeries<T = any> = BaseSeries & {
    type: 'pie';
    data: PieSeriesData<T>[];
    /** The color of the border surrounding each segment. Default `--g-color-base-background` from @gravity-ui/uikit. */
    borderColor?: string;
    /** The width of the border surrounding each segment. Default 1px. */
    borderWidth?: number;
    /** The corner radius of the border surrounding each segment. Default 0. */
    borderRadius?: number;
    /** The center of the pie chart relative to the chart area. */
    center?: [string | number | null, string | number | null];
    /** The inner radius of the pie. Default 0. */
    innerRadius?: string | number;
    /** The name of the series. Applicable in case of using pie chart with multiple series (used in legend) */
    name?: string;
    /** The radius of the pie relative to the chart area. The default behaviour is to scale to the chart area. */
    radius?: string | number;
};
