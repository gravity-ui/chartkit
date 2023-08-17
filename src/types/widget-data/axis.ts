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

    ticks?: {
        /** Pixel interval of the tick marks. Not applicable to categorized axis.
         * The specified value is only a hint; the interval between ticks can be greater or less depending on the data. */
        pixelInterval?: number;
    };

    /** Padding of the max value relative to the length of the axis.
     * A padding of 0.05 will make a 100px axis 5px longer.
     *
     * Defaults to 0.05 for Y axis and to 0.01 for X axis
     * */
    maxPadding?: number;
};
