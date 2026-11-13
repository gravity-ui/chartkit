import {formatBytes, formatDuration, formatNumber} from './format-number';
import {i18nInstance} from './i18n/i18n';
import type {FormatNumberOptions} from './types';

i18nInstance.setLang('en');

describe('plugins/shared', () => {
    test.each<[unknown, FormatNumberOptions | undefined, string]>([
        ['not-a-number', undefined, 'NaN'],
        [NaN, undefined, 'NaN'],
        ['0.2211556', undefined, '0.2211556'],
        ['0.2211556', {precision: 4}, '0.2212'],
        [1.005, {precision: 2}, '1.01'],
        [2.675, {precision: 2}, '2.68'],
        [-1.005, {precision: 2}, '-1.01'],
        [0.01005, {format: 'percent', precision: 2}, '1.01%'],
        [0.145, {format: 'percent', precision: 0}, '15%'],
        [-0.145, {format: 'percent', precision: 0}, '-15%'],
        [0.285, {format: 'percent', precision: 0, lang: 'ru-RU'}, '29%'],
        [1.005, {format: 'percent', precision: 0}, '101%'],
        [12.345, {format: 'percent', unit: 'auto', precision: 2}, '1.23K%'],
        [0.0001245, {format: 'percent', precision: 'auto'}, '0.0125%'],
        [1005, {unit: 'k', precision: 2}, '1.01K'],
        [1.005, {precision: 'auto'}, '1.01'],
        [0.12345, {precision: 'auto'}, '0.1235'],
        [1200, {lang: 'en-US'}, '1,200'],
        [1234567, {lang: 'en-US', unit: 'auto', precision: 1}, '1.2M'],
        [1234567, {lang: 'ru-RU', unit: 'auto', precision: 1}, '1,2M'],
        [1234567, {lang: 'de-DE', unit: 'auto', precision: 1}, '1,2M'],
        [12.4, {signDisplay: 'exceptZero'}, '+12.4'],
        [-12.4, {signDisplay: 'exceptZero'}, '-12.4'],
        [0, {signDisplay: 'exceptZero'}, '0'],
        [0, {signDisplay: 'always'}, '+0'],
        [-12.4, {signDisplay: 'never'}, '12.4'],
        [12.4, {signDisplay: 'auto'}, '12.4'],
        [0.124, {format: 'percent', precision: 1, signDisplay: 'exceptZero'}, '+12.4%'],
        [0.0004, {format: 'percent', precision: 1, signDisplay: 'exceptZero'}, '0.0%'],
        [-0.0004, {format: 'percent', precision: 1, signDisplay: 'exceptZero'}, '0.0%'],
        [12.4, {labelMode: 'percent'}, '12.4%'],
        [0.124, {format: 'percent', multiplier: 10}, '12.4%'],
    ])('formatNumber (args: {value: %p, options: %p})', (value, options, expected) => {
        const result = formatNumber(value as number, options);
        expect(result).toEqual(expected);
    });

    test('localizes unit names independently of the number locale', () => {
        expect(formatBytes(1536, {lang: 'ru-RU'})).toBe('1,5 КБ');
        expect(formatBytes(1536, {lang: 'en-US'})).toBe('1.5 KB');
        expect(formatBytes(1536, {lang: 'de-DE'})).toBe('1,5 KB');
        expect(formatDuration(1500, {lang: 'ru-RU'})).toBe('1,5 с');
        expect(i18nInstance.lang).toBe('en');
    });

    test('preserves the shared locale when formatting fails', () => {
        expect(() => formatNumber(1.005, {lang: 'ru-RU', precision: -1})).toThrow(RangeError);
        expect(i18nInstance.lang).toBe('en');
    });
});
