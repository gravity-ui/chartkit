import {settings} from '../../../libs';
import {formatNumber as defaultFormatNumber} from '../../shared';
import type {IndicatorNumberFormat} from '../types';

export function formatValue(
    {value, numberFormat}: {value: number | string; numberFormat?: IndicatorNumberFormat},
    formatNumber?: (value: number, options: {value: number}) => string,
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
        return formatNumber(value, {value});
    }

    return String(value);
}
