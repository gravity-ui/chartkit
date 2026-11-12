import type {IndicatorWidgetData, IndicatorWidgetDataItem} from './types';

export type IndicatorFormatOptions = {value: string | number} & Record<string, unknown>;

export type NormalizedIndicatorWidgetConfigItem = Omit<
    IndicatorWidgetDataItem,
    'content' | 'color' | 'primaryValue'
> & {
    primaryValue: NonNullable<IndicatorWidgetDataItem['primaryValue']>;
};

export type NormalizedIndicatorWidgetConfig = Omit<IndicatorWidgetData, 'data'> & {
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
