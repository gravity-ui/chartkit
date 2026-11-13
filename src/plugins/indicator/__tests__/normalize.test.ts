import {getValueFormatOptions, normalizeIndicatorData} from '../normalize';
import type {IndicatorWidgetInput} from '../types';

describe('normalizeIndicatorData', () => {
    test('converts aliases, preserves metadata and references, and is idempotent', () => {
        const modern = Object.freeze({value: Object.freeze({value: 0})});
        const custom = {callback: vi.fn()};
        const current = Object.freeze({
            value: 1200,
            color: 'metadata',
            numberFormat: {precision: 2},
            custom,
        });
        const secondaryValue = Object.freeze({value: '—', caption: 'Comparison'});
        const legacy = Object.freeze({
            content: Object.freeze({current}),
            color: 'blue',
            title: 'Revenue',
            size: 'xl' as const,
            nowrap: true,
            secondaryValue,
        });
        const input = Object.freeze({
            data: [modern, legacy],
            defaultColor: 'black',
        }) satisfies IndicatorWidgetInput;
        Object.freeze(input.data);

        const data = normalizeIndicatorData(input);
        const converted = data.data?.[1];
        expect(converted).toEqual({
            value: {value: 1200, color: 'blue', custom},
            title: 'Revenue',
            size: 'xl',
            nowrap: true,
            secondaryValue,
        });
        expect(data.defaultColor).toBe('black');
        expect(data.data?.[0]).toBe(modern);
        expect(converted?.value).toHaveProperty('custom', custom);
        expect(converted?.secondaryValue).toBe(secondaryValue);
        expect(getValueFormatOptions(legacy)).toBe(current);
        expect(custom.callback).not.toHaveBeenCalled();
        expect(normalizeIndicatorData(data)).toBe(data);
    });

    test.each([
        {color: undefined, expected: 'red'},
        {color: '', expected: ''},
    ])('prefers primary value fields with color $color', ({color, expected}) => {
        const value = {value: 0, color};
        const item = {value, content: {current: {value: 500}}, color: 'red'};
        const data = normalizeIndicatorData({data: [item]});
        expect(data.data?.[0]).toEqual({value: {value: 0, color: expected}});
        expect(getValueFormatOptions(item)).toBe(value);
    });

    test('handles missing data', () => {
        const input = {};
        expect(normalizeIndicatorData(input)).toBe(input);
    });

    test('keeps legacy formatNumber fields as formatter metadata', () => {
        const formatNumber = vi.fn();
        const current = {value: 42, formatNumber};
        const item = {content: {current}};
        const data = normalizeIndicatorData({data: [item]});
        expect(data.data?.[0]?.value).toEqual({value: 42});
        expect(getValueFormatOptions(item)).toBe(current);
        expect(formatNumber).not.toHaveBeenCalled();
    });

    test('preserves prototype getters when applying an item color', () => {
        const formatNumber = vi.fn(() => 'custom');
        const numberFormat = {precision: 2};
        class Value {
            get value() {
                return 42;
            }
            get formatNumber() {
                return formatNumber;
            }
            get numberFormat() {
                return numberFormat;
            }
        }
        const item = {value: new Value(), color: 'green'};
        const data = normalizeIndicatorData({data: [item]});
        expect(data.data?.[0]?.value).toEqual({
            value: 42,
            formatNumber,
            numberFormat,
            color: 'green',
        });
        expect(data.data?.[0]?.value.formatNumber).toBe(formatNumber);
        expect(data.data?.[0]?.value.numberFormat).toBe(numberFormat);
        expect(getValueFormatOptions(item)).toBe(item.value);
        expect(formatNumber).not.toHaveBeenCalled();
    });
});
