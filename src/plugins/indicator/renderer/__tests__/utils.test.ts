import {settings} from '../../../../libs';
import type {IndicatorNumberFormat} from '../../index';
import {formatValue} from '../utils';

describe('formatValue', () => {
    afterEach(() => {
        settings.set({lang: 'en'});
    });

    test('explicit options take precedence over the external formatter', () => {
        const numberFormat: IndicatorNumberFormat = {
            format: 'percent',
            precision: 1,
            signDisplay: 'exceptZero',
        };
        const formatNumber = vi.fn(() => 'custom result');

        expect(formatValue({value: 0.124, numberFormat}, formatNumber)).toBe('+12.4%');
        expect(formatNumber).not.toHaveBeenCalled();
    });

    test('an empty explicit format uses the built-in defaults', () => {
        const formatNumber = vi.fn(() => 'custom result');

        expect(formatValue({value: 1200, numberFormat: {}}, formatNumber)).toBe('1,200');
        expect(formatNumber).not.toHaveBeenCalled();
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
