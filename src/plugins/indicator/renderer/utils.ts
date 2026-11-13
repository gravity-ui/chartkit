import {settings} from '../../../libs';
import {formatNumber as defaultFormatNumber} from '../../shared';
import type {IndicatorFormatOptions, NormalizedIndicatorWidgetConfigItem} from '../types';

export function formatValue(
    {
        value,
        formatNumber: localFormatNumber,
        numberFormat,
    }: Pick<
        NormalizedIndicatorWidgetConfigItem['value'],
        'value' | 'formatNumber' | 'numberFormat'
    >,
    formatNumber?: (value: number, options: {value: number | string}) => string,
    formatOptions?: IndicatorFormatOptions,
): string {
    if (typeof value === 'string') {
        return value;
    }

    if (localFormatNumber) {
        return localFormatNumber(value);
    }

    if (numberFormat) {
        return defaultFormatNumber(value, {
            ...numberFormat,
            lang: numberFormat.lang ?? settings.get('lang'),
        });
    }

    if (formatNumber) {
        return formatNumber(value, formatOptions ?? {value});
    }

    return String(value);
}
