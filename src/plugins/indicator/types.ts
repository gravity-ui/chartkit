import type {ReactNode} from 'react';

import type {FormatNumberOptions} from '../shared';

export type IndicatorSecondaryValue = {
    /** Numbers can be formatted; strings are displayed as supplied. */
    value: number | string;
    numberFormat?: FormatNumberOptions;
    caption?: ReactNode;
    /** Defaults to bottom. */
    position?: 'bottom' | 'right';
    /** Any CSS color, including theme variables. Defaults to the primary text color. */
    color?: string;
    /** Badge uses a background derived from color. Defaults to text. */
    view?: 'text' | 'badge';
    /** Hidden by default. */
    arrow?: 'up' | 'down';
};

export type IndicatorWidgetDataItem = {
    content: {
        current: {
            value: string | number;
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
