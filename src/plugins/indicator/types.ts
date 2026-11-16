import type {IndicatorWidgetData, IndicatorWidgetDataItem} from './public-types';

/**
 * Indicator item before normalization, using either value or legacy content.current.
 * When both are provided, value takes precedence.
 */
export type IndicatorWidgetConfigItem =
    | IndicatorWidgetDataItem
    | (Omit<IndicatorWidgetDataItem, 'content' | 'value'> & {
          value: NonNullable<IndicatorWidgetDataItem['value']>;
          content?: IndicatorWidgetDataItem['content'];
      });

/** Indicator configuration accepted by the widget before normalization. */
export type IndicatorWidgetConfig = Omit<IndicatorWidgetData, 'data'> & {
    data?: IndicatorWidgetConfigItem[];
};

/** Original primary value object passed to the widget's formatNumber callback, including application metadata. */
export type IndicatorFormatOptions = {value: string | number} & Record<string, unknown>;

/** Indicator item after normalization, with a required value and no legacy content or item-level color. */
export type NormalizedIndicatorWidgetConfigItem = Omit<
    IndicatorWidgetConfigItem,
    'content' | 'color' | 'value'
> & {
    value: NonNullable<IndicatorWidgetDataItem['value']>;
};

/** Indicator configuration with normalized items, ready for formatting. */
export type NormalizedIndicatorWidgetConfig = Omit<IndicatorWidgetConfig, 'data'> & {
    data?: NormalizedIndicatorWidgetConfigItem[];
};

/** Rendering props with primary and secondary values formatted as strings. */
export type IndicatorItemProps = Pick<
    NormalizedIndicatorWidgetConfigItem,
    'title' | 'size' | 'nowrap'
> & {
    value: Pick<NormalizedIndicatorWidgetConfigItem['value'], 'color'> & {
        value: string;
    };
    secondaryValue?: Omit<
        NonNullable<NormalizedIndicatorWidgetConfigItem['secondaryValue']>,
        'value' | 'formatNumber' | 'numberFormat'
    > & {value: string};
};
