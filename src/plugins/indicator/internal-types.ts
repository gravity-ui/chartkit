import type {IndicatorWidgetData, IndicatorWidgetDataItem} from './types';

export type IndicatorWidgetInputItem =
    | IndicatorWidgetDataItem
    | (Omit<IndicatorWidgetDataItem, 'content' | 'primaryValue'> & {
          primaryValue: NonNullable<IndicatorWidgetDataItem['primaryValue']>;
          content?: IndicatorWidgetDataItem['content'];
      });

export type IndicatorWidgetInput = Omit<IndicatorWidgetData, 'data'> & {
    data?: IndicatorWidgetInputItem[];
};

export type IndicatorFormatOptions = {value: string | number} & Record<string, unknown>;

export type NormalizedIndicatorWidgetConfigItem = Omit<
    IndicatorWidgetInputItem,
    'content' | 'color' | 'primaryValue'
> & {
    primaryValue: NonNullable<IndicatorWidgetDataItem['primaryValue']>;
};

export type NormalizedIndicatorWidgetConfig = Omit<IndicatorWidgetInput, 'data'> & {
    data?: NormalizedIndicatorWidgetConfigItem[];
};

export type IndicatorItemProps = Pick<
    NormalizedIndicatorWidgetConfigItem,
    'title' | 'size' | 'nowrap'
> & {
    primaryValue: Pick<NormalizedIndicatorWidgetConfigItem['primaryValue'], 'color'> & {
        value: string;
    };
    secondaryValue?: Omit<
        NonNullable<NormalizedIndicatorWidgetConfigItem['secondaryValue']>,
        'value' | 'numberFormat'
    > & {value: string};
};
