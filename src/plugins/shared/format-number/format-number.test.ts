import {formatNumber} from './format-number';
import {i18nInstance} from './i18n/i18n';
import type {InternalFormatNumberOptions} from './types';

i18nInstance.setLang('en');

describe('plugins/shared', () => {
    test.each<[unknown, InternalFormatNumberOptions | undefined, string]>([
        ['not-a-number', undefined, 'NaN'],
        [NaN, undefined, 'NaN'],
        ['0.2211556', undefined, '0.2211556'],
        ['0.2211556', {precision: 4}, '0.2212'],
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
});
