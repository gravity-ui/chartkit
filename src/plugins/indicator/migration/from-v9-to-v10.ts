import type {MigrationResult, MigrationWarning} from '../../shared/migration';
import type {
    IndicatorFormatOptions,
    NormalizedIndicatorWidgetConfig,
    NormalizedIndicatorWidgetConfigItem,
} from '../internal-types';
import type {
    IndicatorPrimaryValue,
    IndicatorWidgetConfig,
    IndicatorWidgetConfigItem,
} from '../types';

type IndicatorMigrationWarning = MigrationWarning<'indicator-content' | 'indicator-color'>;

/** Return the original formatNumber options, preserving application metadata and object identity. */
export function getPrimaryValueFormatOptions(
    item: IndicatorWidgetConfigItem,
): IndicatorFormatOptions {
    if (item.primaryValue) {
        return item.primaryValue;
    }
    if (item.content) {
        return item.content.current;
    }
    throw new TypeError('An indicator item requires primaryValue or content.current.');
}

function migratePrimaryValue(item: IndicatorWidgetConfigItem): IndicatorPrimaryValue {
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
export function migrateIndicatorDataFromV9ToV10(
    input: IndicatorWidgetConfig,
): MigrationResult<NormalizedIndicatorWidgetConfig, IndicatorMigrationWarning> {
    const warnings: IndicatorMigrationWarning[] = [];
    const data = input.data?.map((item, index): NormalizedIndicatorWidgetConfigItem => {
        const warn = (
            code: IndicatorMigrationWarning['code'],
            path: (string | number)[],
            message: string,
            replacement: string,
        ) => {
            warnings.push({
                code,
                path: ['data', index, ...path],
                message,
                replacement,
                resolution: 'automatic',
            });
        };

        if ('content' in item) {
            warn(
                'indicator-content',
                ['content'],
                'Use primaryValue instead of content.current.',
                'primaryValue',
            );
        }
        if ('color' in item) {
            warn(
                'indicator-color',
                ['color'],
                'Use primaryValue.color instead of the item color.',
                'primaryValue.color',
            );
        }

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
        return {data: input as NormalizedIndicatorWidgetConfig, warnings};
    }
    return {data: {...input, data}, warnings};
}
