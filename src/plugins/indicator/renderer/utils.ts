import {settings} from '../../../libs';
import {formatNumber as defaultFormatNumber} from '../../shared';
import type {FormatNumberOptions} from '../../shared';

export function formatValue(
    {value, numberFormat}: {value: number | string; numberFormat?: FormatNumberOptions},
    formatNumber?: (value: number, options: FormatNumberOptions & {value: number}) => string,
): string {
    if (typeof value === 'string') {
        return value;
    }

    if (formatNumber) {
        return formatNumber(value, {value, ...numberFormat});
    }

    if (numberFormat) {
        return defaultFormatNumber(value, {
            ...numberFormat,
            lang: numberFormat.lang ?? settings.get('lang'),
        });
    }

    return String(value);
}
