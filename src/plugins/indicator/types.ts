import type {ReactNode} from 'react';

import type {FormatNumberOptions} from '../shared';

export type IndicatorNumberFormat = Pick<
    FormatNumberOptions,
    | 'format'
    | 'precision'
    | 'showRankDelimiter'
    | 'unit'
    | 'prefix'
    | 'postfix'
    | 'lang'
    | 'signDisplay'
>;

export type IndicatorSecondaryValue = {
    /** Numbers can be formatted; strings are displayed as supplied. */
    value: number | string;
    numberFormat?: IndicatorNumberFormat;
    caption?: ReactNode;
    /** Defaults to bottom. */
    position?: 'bottom' | 'right';
    /** Any CSS color, including theme variables. Defaults to the primary text color. */
    color?: string;
    /** Badge uses a background derived from color. Defaults to text. */
    view?: 'text' | 'badge';
    /** Hidden by default. */
    arrow?: 'up' | 'down';
    /** Localized accessible label for the arrow, for example "Increase". */
    arrowLabel?: string;
};

export type IndicatorWidgetDataItem = {
    content: {
        current: {
            value: string | number;
            /** Explicit options take precedence over the widget's formatNumber callback. */
            numberFormat?: IndicatorNumberFormat;
        } & Record<string, unknown>;
    };
    color?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    title?: string;
    nowrap?: boolean;
    secondaryValue?: IndicatorSecondaryValue;
};

export type IndicatorWidgetData = {
    data?: IndicatorWidgetDataItem[];
    defaultColor?: string;
};
