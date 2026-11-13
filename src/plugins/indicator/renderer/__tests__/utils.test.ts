import {settings} from '../../../../libs';
import {formatValue} from '../utils';

describe('formatValue', () => {
    afterEach(() => settings.set({lang: 'en'}));

    test('prefers a local callback over options and the widget callback', () => {
        const localFormatNumber = vi.fn(() => 'local');
        const formatNumber = vi.fn(() => 'widget');
        expect(
            formatValue(
                {
                    value: 0.124,
                    formatNumber: localFormatNumber,
                    numberFormat: {format: 'percent', precision: 1},
                },
                formatNumber,
            ),
        ).toBe('local');
        expect(localFormatNumber).toHaveBeenCalledExactlyOnceWith(0.124);
        expect(formatNumber).not.toHaveBeenCalled();
    });

    test('selects explicit formats, then the callback, then plain text', () => {
        const formatNumber = vi.fn(() => 'custom');
        expect(
            formatValue(
                {
                    value: 0.124,
                    numberFormat: {format: 'percent', precision: 1, signDisplay: 'exceptZero'},
                },
                formatNumber,
            ),
        ).toBe('+12.4%');
        expect(formatValue({value: 1200, numberFormat: {}}, formatNumber)).toBe('1,200');
        expect(formatNumber).not.toHaveBeenCalled();
        expect(formatValue({value: 1200}, formatNumber)).toBe('custom');
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(1200, {value: 1200});
        expect(formatValue({value: 1234.5})).toBe('1234.5');
    });

    test('applies a multiplier and an explicit scale', () => {
        expect(
            formatValue({
                value: 1.5,
                numberFormat: {multiplier: 1000, unit: 'm', unitRate: 1},
            }),
        ).toBe('1.5K');
    });

    test('preserves numeric strings without invoking formatters', () => {
        const localFormatNumber = vi.fn();
        const formatNumber = vi.fn();
        expect(
            formatValue(
                {
                    value: '0.124',
                    formatNumber: localFormatNumber,
                    numberFormat: {format: 'percent', precision: 1},
                },
                formatNumber,
            ),
        ).toBe('0.124');
        expect(localFormatNumber).not.toHaveBeenCalled();
        expect(formatNumber).not.toHaveBeenCalled();
    });

    test('uses the widget locale unless the value overrides it', () => {
        settings.set({lang: 'ru'});
        expect(
            formatValue({
                value: 0.124,
                numberFormat: {format: 'percent', precision: 1},
            }),
        ).toBe('12,4%');
        expect(
            formatValue({
                value: 0.124,
                numberFormat: {format: 'percent', precision: 1, lang: 'en'},
            }),
        ).toBe('12.4%');
    });

    test('supports regional locales and rounds decimal ties in explicit formats', () => {
        expect(formatValue({value: 1200, numberFormat: {lang: 'en-US'}})).toBe('1,200');
        expect(
            formatValue({
                value: 0.01005,
                numberFormat: {lang: 'ru-RU', format: 'percent', precision: 2},
            }),
        ).toBe('1,01%');
    });
});
