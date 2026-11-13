import type {ReactNode} from 'react';

import type {FormatNumberOptions} from '../shared';

type IndicatorValue = {
    /** Numbers can be formatted; strings are displayed as supplied. */
    value: number | string;
    /** Explicit options take precedence over the widget's formatNumber callback. */
    numberFormat?: Omit<FormatNumberOptions, 'labelMode'>;
    /** Any CSS color, including theme variables. */
    color?: string;
};

type IndicatorItemOptions = {
    size?: 's' | 'm' | 'l' | 'xl';
    title?: string;
    nowrap?: boolean;
};

type IndicatorSecondaryValue = IndicatorValue & {
    caption?: ReactNode;
    /** Defaults to bottom. */
    position?: 'bottom' | 'right';
    /** Badge uses a background derived from color. Defaults to text. */
    view?: 'text' | 'badge';
    /** Hidden by default. */
    arrow?: {
        direction: 'up' | 'down';
        /** Localized accessible label, for example "Increase". Omit for a decorative arrow. */
        ariaLabel?: string;
    };
};

type LegacyIndicatorContent = {
    /** @deprecated Use value. */
    current: {value: string | number} & Record<string, unknown>;
};

export type IndicatorWidgetDataItem = IndicatorItemOptions & {
    /** @deprecated Use value in ChartKitProps<'indicator'>['data']. */
    content: LegacyIndicatorContent;
    value?: IndicatorValue & Record<string, unknown>;
    /** @deprecated Use value.color. */
    color?: string;
    secondaryValue?: IndicatorSecondaryValue;
};

export type IndicatorWidgetData = {
    data?: IndicatorWidgetDataItem[];
    /** Fallback color for primary values only. */
    defaultColor?: string;
};
