import type {IndicatorWidgetInput} from '../../types';
import {getValueFormatOptions, migrateIndicatorDataFromV9ToV10} from '../from-v9-to-v10';

describe('migrateIndicatorDataFromV9ToV10', () => {
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

        const {data, warnings} = migrateIndicatorDataFromV9ToV10(input);
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
        expect(converted?.value.custom).toBe(custom);
        expect(converted?.secondaryValue).toBe(secondaryValue);
        expect(getValueFormatOptions(legacy)).toBe(current);
        expect(custom.callback).not.toHaveBeenCalled();
        expect(warnings).toMatchObject([
            {code: 'indicator-content', path: ['data', 1, 'content'], replacement: 'value'},
            {
                code: 'indicator-color',
                path: ['data', 1, 'color'],
                replacement: 'value.color',
            },
        ]);
        const repeated = migrateIndicatorDataFromV9ToV10(data);
        expect(repeated.data).toBe(data);
        expect(repeated.warnings).toEqual([]);
    });

    test.each([
        {color: undefined, expected: 'red'},
        {color: '', expected: ''},
    ])('prefers primary value fields with color $color', ({color, expected}) => {
        const value = {value: 0, color};
        const item = {value, content: {current: {value: 500}}, color: 'red'};
        const {data} = migrateIndicatorDataFromV9ToV10({data: [item]});
        expect(data.data?.[0]).toEqual({value: {value: 0, color: expected}});
        expect(getValueFormatOptions(item)).toBe(value);
    });

    test('handles missing data', () => {
        expect(migrateIndicatorDataFromV9ToV10({})).toEqual({data: {}, warnings: []});
    });
});
