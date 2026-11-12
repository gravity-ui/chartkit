import {settings} from '../../../libs';
import {formatNumber as defaultFormatNumber} from '../../shared';
import type {IndicatorFormatNumberOptions} from '../internal-types';
import type {IndicatorValue} from '../types';

export function formatValue(
    {value, numberFormat}: IndicatorValue,
    formatNumber?: (value: number, options: {value: number | string}) => string,
    formatOptions?: IndicatorFormatNumberOptions,
): string {
    if (typeof value === 'string') {
        return value;
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
