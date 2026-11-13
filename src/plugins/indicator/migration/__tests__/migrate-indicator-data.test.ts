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
});
