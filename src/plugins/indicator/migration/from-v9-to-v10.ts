import type {MigrationResult, MigrationWarning} from '../../shared/migration';
import type {
    IndicatorFormatOptions,
    IndicatorWidgetInput,
    IndicatorWidgetInputItem,
    NormalizedIndicatorWidgetConfig,
    NormalizedIndicatorWidgetConfigItem,
} from '../internal-types';

type IndicatorMigrationWarning = MigrationWarning<'indicator-content' | 'indicator-color'>;

/** Return the original formatNumber options, preserving application metadata and object identity. */
export function getPrimaryValueFormatOptions(
    item: IndicatorWidgetInputItem,
): IndicatorFormatOptions {
    if (item.primaryValue) {
        return item.primaryValue;
    }
    if (item.content) {
        return item.content.current;
    }
    throw new TypeError('An indicator item requires primaryValue or content.current.');
}

function migratePrimaryValue(
    item: IndicatorWidgetInputItem,
): NormalizedIndicatorWidgetConfigItem['primaryValue'] {
    const value = getPrimaryValueFormatOptions(item);
    if (item.primaryValue) {
        return value.color === undefined && item.color !== undefined
            ? {...value, color: item.color}
            : value;
    }
    // Reserved display options on legacy current are opaque formatter metadata.
    if (!('color' in value) && !('numberFormat' in value) && item.color === undefined) {
        return value;
    }
    const {color: _color, numberFormat: _numberFormat, ...rest} = value;
    return item.color === undefined ? rest : {...rest, color: item.color};
}

/**
 * Normalize indicator configuration without mutating input, invoking callbacks or logging.
 */
export function normalizeIndicatorData(
    input: IndicatorWidgetInput,
): NormalizedIndicatorWidgetConfig {
    const data = input.data?.map((item): NormalizedIndicatorWidgetConfigItem => {
        const primaryValue = migratePrimaryValue(item);

        if (item.primaryValue === primaryValue && !('content' in item) && !('color' in item)) {
            return item as NormalizedIndicatorWidgetConfigItem;
        }

        return {
            primaryValue,
            ...(item.secondaryValue ? {secondaryValue: item.secondaryValue} : {}),
            ...(item.title === undefined ? {} : {title: item.title}),
            ...(item.size === undefined ? {} : {size: item.size}),
            ...(item.nowrap === undefined ? {} : {nowrap: item.nowrap}),
        };
    });

    if (data?.every((item, index) => item === input.data?.[index]) ?? true) {
        return input as NormalizedIndicatorWidgetConfig;
    }
    return {...input, data};
}

/** Normalize configuration and collect diagnostics for an explicit migration. */
export function migrateIndicatorDataFromV9ToV10(
    input: IndicatorWidgetInput,
): MigrationResult<NormalizedIndicatorWidgetConfig, IndicatorMigrationWarning> {
    const data = normalizeIndicatorData(input);
    const warnings: IndicatorMigrationWarning[] = [];
    input.data?.forEach((item, index) => {
        if ('content' in item) {
            warnings.push({
                code: 'indicator-content',
                path: ['data', index, 'content'],
                message: 'Use primaryValue instead of content.current.',
                replacement: 'primaryValue',
                resolution: 'automatic',
            });
        }
        if ('color' in item) {
            warnings.push({
                code: 'indicator-color',
                path: ['data', index, 'color'],
                message: 'Use primaryValue.color instead of the item color.',
                replacement: 'primaryValue.color',
                resolution: 'automatic',
            });
        }
    });
    return {data, warnings};
}
