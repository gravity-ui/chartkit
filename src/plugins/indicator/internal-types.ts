import type {
    IndicatorPrimaryValue,
    IndicatorSecondaryValue,
    IndicatorWidgetConfig,
    IndicatorWidgetConfigItem,
} from './types';

export type IndicatorFormatOptions = Pick<IndicatorPrimaryValue, 'value'> & Record<string, unknown>;

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
    primaryValue: Pick<IndicatorPrimaryValue, 'color'> & {value: string};
    secondaryValue?: Omit<IndicatorSecondaryValue, 'value' | 'numberFormat'> & {value: string};
};
