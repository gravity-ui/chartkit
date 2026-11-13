import {migrateIndicatorData} from '../migrate-indicator-data';

describe('migrateIndicatorData', () => {
    test('converts legacy fields, reports their paths and is idempotent', () => {
        const modern = {value: {value: 0}};
        const input = {
            data: [modern, {content: {current: {value: 1200}}, color: 'blue'}],
        };

        const {data, warnings} = migrateIndicatorData(input);

        expect(data.data).toEqual([modern, {value: {value: 1200, color: 'blue'}}]);
        expect(data.data?.[0]).toBe(modern);
        expect(warnings).toEqual([
            {
                code: 'indicator-content',
                path: ['data', 1, 'content'],
                message: 'Use value instead of content.current.',
                replacement: 'value',
                resolution: 'automatic',
            },
            {
                code: 'indicator-color',
                path: ['data', 1, 'color'],
                message: 'Use value.color instead of the item color.',
                replacement: 'value.color',
                resolution: 'automatic',
            },
        ]);

        const repeated = migrateIndicatorData(data);
        expect(repeated.data).toBe(data);
        expect(repeated.warnings).toEqual([]);
    });

    test.each([{}, {data: [{value: {value: 42}}]}])(
        'preserves configurations without legacy fields: %j',
        (input) => {
            const result = migrateIndicatorData(input);
            expect(result.data).toBe(input);
            expect(result.warnings).toEqual([]);
        },
    );

    test.each([
        {field: 'color', metadata: 'USD'},
        {field: 'formatNumber', metadata: vi.fn()},
        {field: 'numberFormat', metadata: {currency: 'USD'}},
    ])('requires review when migrating legacy $field metadata', ({field, metadata}) => {
        const current = Object.freeze({value: 42, [field]: metadata});
        const input = {data: [{value: {value: 0}}, {content: {current}}]};

        const {data, warnings} = migrateIndicatorData(input);

        expect(data.data?.[1]?.value).toEqual({value: 42});
        expect(input.data[1].content?.current).toBe(current);
        expect(warnings).toContainEqual({
            code: 'indicator-formatter-metadata',
            path: ['data', 1, 'content', 'current', field],
            message: `Legacy formatter metadata "${field}" is removed or replaced during migration. Update any widget formatNumber callback that depends on it.`,
            resolution: 'review',
        });
        if (typeof metadata === 'function') {
            expect(metadata).not.toHaveBeenCalled();
        }
    });

    test('does not require review for legacy metadata overridden by value', () => {
        const value = {value: 42};
        const input = {data: [{value, content: {current: {value: 10, color: 'USD'}}}]};

        const {data, warnings} = migrateIndicatorData(input);

        expect(data.data?.[0]?.value).toBe(value);
        expect(warnings).toHaveLength(1);
        expect(warnings[0].resolution).toBe('automatic');
    });

    test('reports every metadata conflict when the item color replaces legacy metadata', () => {
        const current = {value: 42, color: 'USD', formatNumber: 'custom', numberFormat: 'currency'};

        const {data, warnings} = migrateIndicatorData({
            data: [{content: {current}, color: 'blue'}],
        });

        expect(data.data?.[0]?.value).toEqual({value: 42, color: 'blue'});
        expect(
            warnings.filter(({resolution}) => resolution === 'review').map(({path}) => path),
        ).toEqual([
            ['data', 0, 'content', 'current', 'color'],
            ['data', 0, 'content', 'current', 'formatNumber'],
            ['data', 0, 'content', 'current', 'numberFormat'],
        ]);
        expect(current.color).toBe('USD');
        expect(migrateIndicatorData(data).warnings).toEqual([]);
    });

    test('preserves non-conflicting formatter metadata without requiring review', () => {
        const current = {value: 42, currency: 'USD'};

        const {data, warnings} = migrateIndicatorData({data: [{content: {current}}]});

        expect(data.data?.[0]?.value).toBe(current);
        expect(warnings).toHaveLength(1);
        expect(warnings[0].resolution).toBe('automatic');
    });
});
