import {settings} from '../../../libs';
import {formatNumber as defaultFormatNumber} from '../../shared';
import type {IndicatorFormatOptions, NormalizedIndicatorWidgetConfigItem} from '../internal-types';

export function formatValue(
    {
        value,
        numberFormat,
    }: Pick<NormalizedIndicatorWidgetConfigItem['primaryValue'], 'value' | 'numberFormat'>,
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
