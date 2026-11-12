import type {ComponentProps} from 'react';

import {expectTypeOf} from 'vitest';

import type {ChartKit} from '../../../components/ChartKit';
import type {ErrorBoundary} from '../../../components/ErrorBoundary/ErrorBoundary';
import type {ChartKitProps, ChartKitType, ChartKitWidget} from '../../../types';
import type {
    IndicatorArrow,
    IndicatorProps,
    IndicatorSecondaryValue,
    IndicatorWidgetConfig,
    IndicatorWidgetConfigItem,
    IndicatorWidgetData,
    IndicatorWidgetDataItem,
} from '../index';

type InputProps = Parameters<typeof ChartKit<'indicator'>>[0];

describe('indicator public types', () => {
    test('retains the original legacy property types and indexed access', () => {
        const item: IndicatorWidgetDataItem = {
            content: {current: {value: 42, customMetadata: 'retained', numberFormat: 'metadata'}},
        };
        expectTypeOf(item.content.current.value).toEqualTypeOf<string | number>();
        expectTypeOf(item.content.current.customMetadata).toEqualTypeOf<unknown>();
        expectTypeOf(item.content.current.numberFormat).toEqualTypeOf<unknown>();
        expectTypeOf<IndicatorWidgetDataItem['content']['current']['value']>().toEqualTypeOf<
            string | number
        >();
        expectTypeOf<IndicatorWidgetDataItem['secondaryValue']>().toEqualTypeOf<
            IndicatorSecondaryValue | undefined
        >();
        expectTypeOf<
            NonNullable<IndicatorWidgetData['data']>[number]
        >().toEqualTypeOf<IndicatorWidgetDataItem>();
    });

    test('accepts both APIs and mixed configurations through the component', () => {
        expectTypeOf<ChartKitProps<'indicator'>['data']>().toEqualTypeOf<IndicatorWidgetConfig>();
        expectTypeOf<ChartKitWidget['indicator']['data']>().toEqualTypeOf<IndicatorWidgetConfig>();
        expectTypeOf<IndicatorWidgetData>().toExtend<InputProps['data']>();
        expectTypeOf<IndicatorWidgetConfig>().toExtend<InputProps['data']>();
        expectTypeOf<IndicatorProps>().toExtend<InputProps>();
        expectTypeOf<ChartKitProps<'indicator'>>().toExtend<InputProps>();

        const mixed = {
            data: [
                {content: {current: {value: 42}}},
                {primaryValue: {value: 42}},
                {
                    content: {current: {value: 1}},
                    secondaryValue: {value: 1, arrow: {direction: 'up'}},
                },
                {
                    primaryValue: {value: 1},
                    secondaryValue: {value: 1, arrow: {direction: 'down', ariaLabel: 'Decrease'}},
                },
            ],
        } satisfies IndicatorWidgetConfig;
        expectTypeOf(mixed).toExtend<InputProps['data']>();
    });

    test('requires a value and a supported arrow direction', () => {
        expectTypeOf<{}>().not.toExtend<IndicatorWidgetConfigItem>();
        expectTypeOf<{primaryValue: {value: boolean}}>().not.toExtend<IndicatorWidgetConfigItem>();
        expectTypeOf<{
            primaryValue: {value: number};
            secondaryValue: {value: number; arrow: {direction: 'left'}};
        }>().not.toExtend<IndicatorWidgetConfigItem>();
        expectTypeOf<IndicatorSecondaryValue['arrow']>().toEqualTypeOf<
            IndicatorArrow | undefined
        >();
        expectTypeOf<{value: number; arrow: 'up'}>().not.toExtend<IndicatorSecondaryValue>();
    });

    test('keeps error boundary data restricted to supported widget configurations', () => {
        type BoundaryData = ComponentProps<typeof ErrorBoundary>['data'];
        expectTypeOf<BoundaryData>().toEqualTypeOf<ChartKitWidget[ChartKitType]['data']>();
        expectTypeOf<IndicatorWidgetConfig>().toExtend<BoundaryData>();
        expectTypeOf<ChartKitWidget[keyof ChartKitWidget]['data']>().toExtend<BoundaryData>();
        expectTypeOf<number>().not.toExtend<BoundaryData>();
        expectTypeOf<string>().not.toExtend<BoundaryData>();
    });

    test('accepts wrappers using the original generic ChartKitProps', () => {
        function wrapper<T extends ChartKitType>(props: ChartKitProps<T>) {
            const componentProps: Parameters<typeof ChartKit<T>>[0] = props;
            return componentProps;
        }
        expectTypeOf(wrapper<'indicator'>)
            .parameter(0)
            .toEqualTypeOf<ChartKitProps<'indicator'>>();
    });
});
