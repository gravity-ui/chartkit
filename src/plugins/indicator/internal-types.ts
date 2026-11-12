import type {
    IndicatorPrimaryValue,
    IndicatorSecondaryValue,
    IndicatorValue,
    IndicatorWidgetConfig,
    IndicatorWidgetConfigItem,
} from './types';

export type IndicatorFormatNumberOptions = Pick<IndicatorValue, 'value'> & Record<string, unknown>;

export type NormalizedIndicatorWidgetConfigItem = Omit<
    IndicatorWidgetConfigItem,
    'content' | 'color' | 'primaryValue'
> & {
    primaryValue: IndicatorPrimaryValue;
};

export type NormalizedIndicatorWidgetConfig = Omit<IndicatorWidgetConfig, 'data'> & {
    data?: NormalizedIndicatorWidgetConfigItem[];
};

export type IndicatorItemProps = Pick<
    NormalizedIndicatorWidgetConfigItem,
    'title' | 'size' | 'nowrap'
> & {
    primaryValue: Pick<IndicatorValue, 'color'> & {value: string};
    secondaryValue?: Omit<IndicatorSecondaryValue, 'value' | 'numberFormat'> & {value: string};
};
