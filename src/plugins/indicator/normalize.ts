import type {
    IndicatorFormatOptions,
    IndicatorWidgetConfig,
    IndicatorWidgetConfigItem,
    NormalizedIndicatorWidgetConfig,
    NormalizedIndicatorWidgetConfigItem,
} from './types';

// These legacy metadata keys have display semantics on a modern value.
export const LEGACY_FORMATTER_METADATA_FIELDS = ['color', 'formatNumber', 'numberFormat'] as const;

/** Return the original formatNumber options, preserving application metadata and object identity. */
export function getValueFormatOptions(item: IndicatorWidgetConfigItem): IndicatorFormatOptions {
    if (item.value) {
        return item.value;
    }
    if (item.content) {
        return item.content.current;
    }
    throw new TypeError('An indicator item requires value or content.current.');
}

function normalizeValue(
    item: IndicatorWidgetConfigItem,
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
        !LEGACY_FORMATTER_METADATA_FIELDS.some((field) => field in value) &&
        item.color === undefined
    ) {
        return value;
    }
    const {value: rawValue, ...metadata} = value;
    for (const field of LEGACY_FORMATTER_METADATA_FIELDS) {
        delete metadata[field];
    }
    return item.color === undefined
        ? {...metadata, value: rawValue}
        : {...metadata, value: rawValue, color: item.color};
}

/**
 * Normalize indicator configuration without mutating input, invoking callbacks or logging.
 */
export function normalizeIndicatorData(
    input: IndicatorWidgetConfig,
): NormalizedIndicatorWidgetConfig {
    const data = input.data?.map((item): NormalizedIndicatorWidgetConfigItem => {
        const value = normalizeValue(item);

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
