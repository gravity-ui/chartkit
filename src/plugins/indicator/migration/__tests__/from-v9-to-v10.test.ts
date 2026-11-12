import type {NormalizedIndicatorWidgetConfig} from '../../internal-types';
import type {IndicatorWidgetConfig, IndicatorWidgetData} from '../../types';
import {getPrimaryValueFormatOptions, migrateIndicatorDataFromV9ToV10} from '../from-v9-to-v10';

function getItem(data: NormalizedIndicatorWidgetConfig, index = 0) {
    const item = data.data?.[index];
    if (!item) {
        throw new Error(`Missing indicator item ${index}`);
    }
    return item;
}

describe('migrateIndicatorDataFromV9ToV10', () => {
    test('converts legacy fields without changing input or interpreting application metadata', () => {
        const callback = vi.fn();
        const current = Object.freeze({
            value: 1200,
            numberFormat: {precision: 0},
            custom: {callback},
        });
        const secondaryValue = Object.freeze({
            value: 0.124,
            caption: 'vs last month',
            numberFormat: {format: 'percent' as const},
            position: 'right' as const,
            view: 'badge' as const,
            color: 'green',
            arrow: {direction: 'up' as const, ariaLabel: 'Increase'},
        });
        const item = Object.freeze({
            content: Object.freeze({current}),
            color: 'blue',
            title: 'Revenue',
            size: 'xl' as const,
            nowrap: true,
            secondaryValue,
        });
        const input = Object.freeze({
            data: [item],
            defaultColor: 'black',
        }) satisfies IndicatorWidgetData;
        Object.freeze(input.data);

        const {data, warnings} = migrateIndicatorDataFromV9ToV10(input);

        expect(data).toEqual({
            defaultColor: 'black',
            data: [
                {
                    primaryValue: {value: current.value, custom: current.custom, color: 'blue'},
                    secondaryValue: {
                        value: secondaryValue.value,
                        caption: secondaryValue.caption,
                        numberFormat: secondaryValue.numberFormat,
                        position: 'right',
                        view: 'badge',
                        color: 'green',
                        arrow: {direction: 'up', ariaLabel: 'Increase'},
                    },
                    title: 'Revenue',
                    size: 'xl',
                    nowrap: true,
                },
            ],
        });
        expect(getItem(data).primaryValue.custom).toBe(current.custom);
        expect(getItem(data).primaryValue.numberFormat).toBeUndefined();
        expect(getItem(data).secondaryValue).toBe(secondaryValue);
        expect(getPrimaryValueFormatOptions(item)).toBe(current);
        expect(input.data[0]).toBe(item);
        expect(callback).not.toHaveBeenCalled();
        expect(
            warnings.map(({code, path, replacement, resolution}) => ({
                code,
                path,
                replacement,
                resolution,
            })),
        ).toEqual([
            {
                code: 'indicator-content',
                path: ['data', 0, 'content'],
                replacement: 'primaryValue',
                resolution: 'automatic',
            },
            {
                code: 'indicator-color',
                path: ['data', 0, 'color'],
                replacement: 'primaryValue.color',
                resolution: 'automatic',
            },
        ]);
    });

    test('keeps modern configurations and unchanged items by reference', () => {
        const modern = {
            data: [{primaryValue: {value: 0, color: ''}, secondaryValue: {value: '—'}}],
        } satisfies IndicatorWidgetConfig;
        expect(migrateIndicatorDataFromV9ToV10(modern)).toEqual({data: modern, warnings: []});
        expect(migrateIndicatorDataFromV9ToV10(modern).data).toBe(modern);

        const mixed: IndicatorWidgetConfig = {
            data: [modern.data[0], {content: {current: {value: ''}}}],
        };
        const migrated = migrateIndicatorDataFromV9ToV10(mixed).data;
        expect(getItem(migrated)).toBe(modern.data[0]);
        expect(getItem(migrated, 1).primaryValue.value).toBe('');
    });

    test('is idempotent and does not report aliases after conversion', () => {
        const first = migrateIndicatorDataFromV9ToV10({
            data: [
                {
                    content: {current: {value: 0}},
                    color: '',
                    secondaryValue: {
                        value: '0%',
                        arrow: {direction: 'down', ariaLabel: 'Decrease'},
                    },
                },
            ],
        });
        const second = migrateIndicatorDataFromV9ToV10(first.data);
        expect(second.data).toBe(first.data);
        expect(second.warnings).toEqual([]);
    });

    test('uses the new primary value and color before legacy aliases', () => {
        const primaryValue = {value: 0, color: '', custom: 'new'};
        const item = {
            primaryValue,
            content: {current: {value: 500, numberFormat: {precision: 2}}},
            color: 'red',
            secondaryValue: {
                value: '',
                arrow: {direction: 'down' as const, ariaLabel: ''},
            },
        };
        const {data} = migrateIndicatorDataFromV9ToV10({data: [item]});
        expect(getItem(data).primaryValue).toBe(primaryValue);
        expect(getPrimaryValueFormatOptions(item)).toBe(primaryValue);
        expect(getItem(data).secondaryValue?.arrow).toEqual({direction: 'down', ariaLabel: ''});
        expect(getItem(data)).not.toHaveProperty('content');
        expect(getItem(data)).not.toHaveProperty('color');
    });

    test('uses the legacy item color when the primary value has no color', () => {
        const {data} = migrateIndicatorDataFromV9ToV10({
            data: [
                {
                    primaryValue: {value: '—'},
                    color: 'red',
                    secondaryValue: {
                        value: 'N/A',
                        arrow: {direction: 'down'},
                    },
                },
            ],
        });
        expect(getItem(data).primaryValue.color).toBe('red');
        expect(getItem(data).secondaryValue?.arrow).toEqual({
            direction: 'down',
        });
    });

    test.each([undefined, '', 'blue'])(
        'keeps current.color as formatter metadata with item color %s',
        (color) => {
            const current = {value: 42, color: 'metadata only'};
            const item = {content: {current}, color};
            const {data} = migrateIndicatorDataFromV9ToV10({data: [item]});
            expect(getItem(data).primaryValue.color).toBe(color);
            expect(getPrimaryValueFormatOptions(item)).toBe(current);
            expect(current.color).toBe('metadata only');
        },
    );

    test('preserves optional secondary values and their reference', () => {
        const secondaryValue = {value: '—', arrow: {direction: 'up' as const}};
        const {data} = migrateIndicatorDataFromV9ToV10({
            data: [
                {content: {current: {value: '—'}}, secondaryValue},
                {content: {current: {value: '—'}}},
            ],
        });
        expect(getItem(data).secondaryValue).toBe(secondaryValue);
        expect(getItem(data, 1).secondaryValue).toBeUndefined();
    });

    test('removes explicitly undefined legacy aliases', () => {
        const {data} = migrateIndicatorDataFromV9ToV10({
            data: [
                {
                    primaryValue: {value: 0},
                    content: undefined,
                    color: undefined,
                },
            ],
        });
        expect(getItem(data)).not.toHaveProperty('content');
        expect(getItem(data)).not.toHaveProperty('color');
    });

    test.each([{}, {data: []}, {data: undefined, defaultColor: 'blue'}])(
        'preserves empty input %j for the widget no-data state',
        (input) => {
            expect(migrateIndicatorDataFromV9ToV10(input)).toEqual({data: input, warnings: []});
            expect(migrateIndicatorDataFromV9ToV10(input).data).toBe(input);
        },
    );
});
