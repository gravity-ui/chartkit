import type {ReactNode} from 'react';

import type {FormatNumberOptions} from '../shared';

type IndicatorValue = {
    /** Numbers can be formatted; strings are displayed as supplied. */
    value: number | string;
    /** Explicit options take precedence over the widget's formatNumber callback. */
    numberFormat?: FormatNumberOptions;
    /** Any CSS color, including theme variables. */
    color?: string;
};

type IndicatorPrimaryValue = IndicatorValue & Record<string, unknown>;

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
    /** @deprecated Use primaryValue. */
    current: {value: string | number} & Record<string, unknown>;
};

export type IndicatorWidgetDataItem = IndicatorItemOptions & {
    /** @deprecated Use primaryValue.color. */
    color?: string;
    secondaryValue?: IndicatorSecondaryValue;
} & (
        | {
              primaryValue: IndicatorPrimaryValue;
              /** @deprecated Use primaryValue. */
              content?: LegacyIndicatorContent;
          }
        | {
              primaryValue?: IndicatorPrimaryValue;
              /** @deprecated Use primaryValue. */
              content: LegacyIndicatorContent;
          }
    );

export type IndicatorWidgetData = {
    data?: IndicatorWidgetDataItem[];
    /** Fallback color for primary values only. */
    defaultColor?: string;
};
