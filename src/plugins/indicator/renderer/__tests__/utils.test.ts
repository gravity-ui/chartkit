import {settings} from '../../../../libs';
import type {FormatNumberOptions} from '../../index';
import {formatValue} from '../utils';

describe('formatValue', () => {
    afterEach(() => {
        settings.set({lang: 'en'});
    });

    test('passes numbers and their formatting options to the external formatter', () => {
        const numberFormat: FormatNumberOptions = {
            format: 'percent',
            precision: 1,
            signDisplay: 'exceptZero',
        };
        const formatNumber = vi.fn(() => 'custom result');

        expect(formatValue({value: 0.124, numberFormat}, formatNumber)).toBe('custom result');
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(0.124, {
            ...numberFormat,
            value: 0.124,
        });
    });

    test('preserves the actual value when formatting options come from another value', () => {
        const mainValueFormatting = {value: 1000, format: 'percent' as const, precision: 1};
        const formatNumber = vi.fn((_value: number, options: {value: number}) =>
            String(options.value),
        );

        expect(formatValue({value: 0.124, numberFormat: mainValueFormatting}, formatNumber)).toBe(
            '0.124',
        );
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(0.124, {
            ...mainValueFormatting,
            value: 0.124,
        });
    });

    test.each(['+12.4%', '—', '0.124'])('preserves the supplied string %s', (value) => {
        const formatNumber = vi.fn();

        expect(
            formatValue({value, numberFormat: {format: 'percent', precision: 1}}, formatNumber),
        ).toBe(value);
        expect(formatNumber).not.toHaveBeenCalled();
    });

    test('uses the external formatter even without numberFormat', () => {
        const formatNumber = vi.fn(() => 'custom result');

        expect(formatValue({value: 1200}, formatNumber)).toBe('custom result');
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(1200, {value: 1200});
    });

    test('leaves numbers unformatted when neither formatter nor options are supplied', () => {
        expect(formatValue({value: 1234.5})).toBe('1234.5');
    });

    test('uses the ChartKit locale for built-in formatting', () => {
        settings.set({lang: 'ru'});

        expect(
            formatValue({
                value: 0.124,
                numberFormat: {format: 'percent', precision: 1, signDisplay: 'exceptZero'},
            }),
        ).toBe('+12,4%');
    });

    test('allows the config to override the ChartKit locale', () => {
        settings.set({lang: 'ru'});

        expect(
            formatValue({
                value: 0.124,
                numberFormat: {format: 'percent', precision: 1, lang: 'en'},
            }),
        ).toBe('12.4%');
    });
});
