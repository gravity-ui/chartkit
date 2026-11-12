import {settings} from '../../../libs';
import {formatNumber as defaultFormatNumber} from '../../shared';
import type {IndicatorFormatOptions} from '../internal-types';
import type {IndicatorPrimaryValue} from '../types';

export function formatValue(
    {value, numberFormat}: Pick<IndicatorPrimaryValue, 'value' | 'numberFormat'>,
    formatNumber?: (value: number, options: {value: number | string}) => string,
    formatOptions?: IndicatorFormatOptions,
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
