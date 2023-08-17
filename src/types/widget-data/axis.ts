import type {FormatNumberOptions} from '../../plugins/shared';
import type {BaseTextStyle} from './base';

export type ChartKitWidgetAxisType = 'category' | 'datetime' | 'linear';

export type ChartKitWidgetAxisLabels = {
    /** Enable or disable the axis labels */
    enabled?: boolean;
    /** The pixel padding for axis labels */
    padding?: number;
    dateFormat?: string;
    numberFormat?: FormatNumberOptions;
    style?: Partial<BaseTextStyle>;
};

export type ChartKitWidgetAxis = {
    categories?: string[];
    timestamps?: number[];
    type?: ChartKitWidgetAxisType;
    /** The axis labels show the number or category for each tick */
    labels?: ChartKitWidgetAxisLabels;
    title?: {
        text?: string;
    };

    /** The minimum value of the axis. If undefined the min value is automatically calculate */
    min?: number;

    grid?: {
        /** Enable or disable the grid lines.
         *
         * Defaults to true.
         * */
        enabled?: boolean;
    };
};
