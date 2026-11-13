import type {IndicatorWidgetData, IndicatorWidgetDataItem} from './public-types';

export type IndicatorWidgetInputItem =
    | IndicatorWidgetDataItem
    | (Omit<IndicatorWidgetDataItem, 'content' | 'value'> & {
          value: NonNullable<IndicatorWidgetDataItem['value']>;
          content?: IndicatorWidgetDataItem['content'];
      });

export type IndicatorWidgetInput = Omit<IndicatorWidgetData, 'data'> & {
    data?: IndicatorWidgetInputItem[];
};

export type IndicatorFormatOptions = {value: string | number} & Record<string, unknown>;

export type NormalizedIndicatorWidgetConfigItem = Omit<
    IndicatorWidgetInputItem,
    'content' | 'color' | 'value'
> & {
    value: NonNullable<IndicatorWidgetDataItem['value']>;
};

export type NormalizedIndicatorWidgetConfig = Omit<IndicatorWidgetInput, 'data'> & {
    data?: NormalizedIndicatorWidgetConfigItem[];
};

export type IndicatorItemProps = Pick<
    NormalizedIndicatorWidgetConfigItem,
    'title' | 'size' | 'nowrap'
> & {
    value: Pick<NormalizedIndicatorWidgetConfigItem['value'], 'color'> & {
        value: string;
    };
    secondaryValue?: Omit<
        NonNullable<NormalizedIndicatorWidgetConfigItem['secondaryValue']>,
        'value' | 'numberFormat'
    > & {value: string};
};
