import type {MigrationResult, MigrationWarning} from '../../shared/migration';
import type {
    IndicatorFormatOptions,
    IndicatorWidgetInput,
    IndicatorWidgetInputItem,
    NormalizedIndicatorWidgetConfig,
    NormalizedIndicatorWidgetConfigItem,
} from '../types';

type IndicatorMigrationWarning = MigrationWarning<'indicator-content' | 'indicator-color'>;

/** Return the original formatNumber options, preserving application metadata and object identity. */
export function getValueFormatOptions(item: IndicatorWidgetInputItem): IndicatorFormatOptions {
    if (item.value) {
        return item.value;
    }
    if (item.content) {
        return item.content.current;
    }
    throw new TypeError('An indicator item requires value or content.current.');
}

function migrateValue(
    item: IndicatorWidgetInputItem,
): NormalizedIndicatorWidgetConfigItem['value'] {
    const value = getValueFormatOptions(item);
    if (item.value) {
        if (value.color === undefined && item.color !== undefined) {
            const {value: rawValue, formatNumber, numberFormat, ...rest} = item.value;
            return {...rest, value: rawValue, formatNumber, numberFormat, color: item.color};
        }
        return value;
    }
    if (
        !('color' in value) &&
        !('formatNumber' in value) &&
        !('numberFormat' in value) &&
        item.color === undefined
    ) {
        return value;
    }
    const {
        value: rawValue,
        color: _color,
        formatNumber: _formatNumber,
        numberFormat: _numberFormat,
        ...rest
    } = value;
    return item.color === undefined
        ? {...rest, value: rawValue}
        : {...rest, value: rawValue, color: item.color};
}

/**
 * Normalize indicator configuration without mutating input, invoking callbacks or logging.
 */
export function normalizeIndicatorData(
    input: IndicatorWidgetInput,
): NormalizedIndicatorWidgetConfig {
    const data = input.data?.map((item): NormalizedIndicatorWidgetConfigItem => {
        const value = migrateValue(item);

        if (item.value === value && !('content' in item) && !('color' in item)) {
            return item as NormalizedIndicatorWidgetConfigItem;
        }

        return {
            value,
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
                message: 'Use value instead of content.current.',
                replacement: 'value',
                resolution: 'automatic',
            });
        }
        if ('color' in item) {
            warnings.push({
                code: 'indicator-color',
                path: ['data', index, 'color'],
                message: 'Use value.color instead of the item color.',
                replacement: 'value.color',
                resolution: 'automatic',
            });
        }
    });
    return {data, warnings};
}
