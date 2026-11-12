import {i18nInstance, makeInstance} from './i18n/i18n';
import type {FormatOptions, InternalFormatNumberOptions} from './types';

import en from './i18n/en.json';
import ru from './i18n/ru.json';

const i18n = makeInstance('chartkit-units', {ru, en});

function getUnitRate(value: number, exponent: number, unitsI18nKeys: string[]) {
    let resultUnitRate = 1;
    while (
        Math.abs(value / Math.pow(exponent, resultUnitRate)) >= 1 &&
        resultUnitRate < unitsI18nKeys.length
    ) {
        resultUnitRate++;
    }

    return resultUnitRate - 1;
}

const unitFormatter = ({
    exponent,
    unitsI18nKeys,
    unitDelimiterI18nKey,
}: {
    exponent: number;
    unitsI18nKeys: string[];
    unitDelimiterI18nKey: string;
}) => {
    return function formatUnit(
        value: number,
        options: FormatOptions = {},
        format: 'number' | 'percent' = 'number',
    ) {
        const {precision, unitRate, showRankDelimiter = true, lang, signDisplay} = options;

        const locale = lang ?? (i18nInstance.lang as string);
        const isPercent = format === 'percent';
        const resultUnitRate =
            typeof unitRate === 'number'
                ? unitRate
                : getUnitRate(isPercent ? value * 100 : value, exponent, unitsI18nKeys);

        const scaledValue = value / Math.pow(exponent, resultUnitRate);
        let maximumFractionDigits = 20;
        if (typeof precision === 'number') {
            maximumFractionDigits = precision;
        } else if (precision === 'auto') {
            maximumFractionDigits = Math.abs(scaledValue) > (isPercent ? 0.01 : 1) ? 2 : 4;
        }
        const formatter = new Intl.NumberFormat(locale, {
            style: isPercent ? 'percent' : 'decimal',
            minimumFractionDigits: typeof precision === 'number' ? precision : 0,
            maximumFractionDigits,
            useGrouping: showRankDelimiter,
            signDisplay,
        });
        // Let Intl scale percentages without floating-point multiplication. Keep the existing
        // trailing-percent convention rather than Intl's locale-specific sign placement/spacing.
        const result = isPercent
            ? formatter
                  .formatToParts(scaledValue)
                  .filter(
                      ({type, value: part}) =>
                          type !== 'percentSign' && (type !== 'literal' || part.trim() !== ''),
                  )
                  .map(({value: part}) => part)
                  .join('')
            : formatter.format(scaledValue);

        // Number locales can include regions and extensions; unit keysets support en and ru.
        const unitsLang = new Intl.Locale(locale).language === 'ru' ? 'ru' : 'en';
        const i18nLang = i18nInstance.lang as string;
        i18nInstance.setLang(unitsLang);
        try {
            const unit = i18n(unitsI18nKeys[resultUnitRate]);
            const delimiter = i18n(unitDelimiterI18nKey);

            return `${result}${delimiter}${unit}`;
        } finally {
            i18nInstance.setLang(i18nLang);
        }
    };
};

export const formatBytes = unitFormatter({
    exponent: 1024,
    unitDelimiterI18nKey: 'value_space-delimiter',
    unitsI18nKeys: ['value_short-bytes', 'value_short-kilobytes', 'value_short-megabytes'],
});

export const formatDuration = unitFormatter({
    exponent: 1000,
    unitDelimiterI18nKey: 'value_space-delimiter',
    unitsI18nKeys: ['value_short-milliseconds', 'value_short-seconds', 'value_short-minutes'],
});

const BASE_NUMBER_FORMAT_UNIT_KEYS = [
    'value_short-empty',
    'value_short-k',
    'value_short-m',
    'value_short-b',
    'value_short-t',
];

const baseFormatNumber = unitFormatter({
    exponent: 1000,
    unitDelimiterI18nKey: 'value_number-delimiter',
    unitsI18nKeys: BASE_NUMBER_FORMAT_UNIT_KEYS,
});

export const getNumberUnitRate = (value: number) =>
    getUnitRate(value, 1000, BASE_NUMBER_FORMAT_UNIT_KEYS);

const NUMBER_UNIT_RATE_BY_UNIT = {
    default: 0,
    auto: undefined,
    k: 1,
    m: 2,
    b: 3,
    t: 4,
};

export const formatNumber = (value: number | string, options: InternalFormatNumberOptions = {}) => {
    if (Number.isNaN(value) || Number.isNaN(Number(value))) {
        return new Intl.NumberFormat('en').format(Number(value));
    }

    const {
        format = 'number',
        multiplier = 1,
        prefix = '',
        postfix = '',
        unit,
        unitRate,
        labelMode,
    } = options;

    let changedMultiplier = multiplier;
    let prePostfix = '';

    if (format === 'percent') {
        changedMultiplier = 1;
        prePostfix = '%';
    }

    if (labelMode === 'percent') {
        prePostfix = '%';
    }

    const formattedValue = baseFormatNumber(
        Number(value) * changedMultiplier,
        {
            ...options,
            unitRate: unitRate ?? NUMBER_UNIT_RATE_BY_UNIT[unit ?? 'default'],
        },
        format,
    );

    return `${prefix}${formattedValue}${prePostfix}${postfix}`;
};
