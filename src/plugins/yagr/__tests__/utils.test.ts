import type {YagrChartOptions} from '@gravity-ui/yagr';

import {getUplotTimezoneAligner, shapeYagrConfig} from '../renderer/utils';
import type {MinimalValidConfig, YagrGraph, YagrWidgetData} from '../types';

const DATA: YagrWidgetData['data'] = {
    timeline: [1],
    graphs: [{data: [45]}],
};

vi.mock('@gravity-ui/date-utils', async () => {
    const originalModule =
        await vi.importActual<typeof import('@gravity-ui/date-utils')>('@gravity-ui/date-utils');
    return {
        ...originalModule,
        dateTime: ({input, timeZone}: {input: number; timeZone?: string}) => {
            const browserMockedTimezone = 'Europe/Moscow';
            return originalModule.dateTime({
                input,
                timeZone: timeZone || browserMockedTimezone,
            });
        },
    };
});

describe('plugins/yagr/utils', () => {
    describe('shapeYagrConfig > check chart property', () => {
        test.each<[Partial<MinimalValidConfig['chart']>, Partial<MinimalValidConfig['chart']>]>([
            [{}, {appearance: {locale: 'en', theme: 'dark'}}],
            [{appearance: {locale: 'ru'}}, {appearance: {locale: 'ru', theme: 'dark'}}],
            [{appearance: {theme: 'light'}}, {appearance: {locale: 'en', theme: 'light'}}],
            [
                {series: {type: 'dots'}, select: {zoom: false}, timeMultiplier: 1},
                {
                    appearance: {locale: 'en', theme: 'dark'},
                    series: {type: 'dots'},
                    select: {zoom: false},
                    timeMultiplier: 1,
                },
            ],
        ])('(args: %j)', (chart, expected) => {
            const config = shapeYagrConfig({data: DATA, libraryConfig: {chart}, theme: 'dark'});
            expect(config.chart).toEqual(expected);
        });
    });

    describe('data labels preparation', () => {
        const cases: {
            name: string;
            graph: YagrGraph;
            expected: (number | string | null)[];
        }[] = [
            {
                name: 'legacy values',
                graph: {data: [10, '020', null, 0]},
                expected: [10, '020', null, 0],
            },
            {
                name: 'labeled points',
                graph: {
                    _data: [
                        {value: 10, label: 'Plan'},
                        {value: '020'},
                        {value: 15, label: ''},
                        {value: 0, label: null},
                        {value: null, label: 'Missing'},
                    ],
                },
                expected: [10, '020', 15, 0, null],
            },
            {name: 'empty values', graph: {data: []}, expected: []},
            {name: 'empty labeled points', graph: {_data: []}, expected: []},
            {
                name: 'labeled points override legacy values',
                graph: {data: [99], _data: [{value: 10}]},
                expected: [10],
            },
            {
                name: 'empty labeled points fall back to legacy values',
                graph: {data: [99], _data: []},
                expected: [99],
            },
            {
                name: 'null legacy values',
                graph: {data: [null, null]},
                expected: [null, null],
            },
        ];

        test.each(cases)('prepares $name without mutating input', ({graph, expected}) => {
            const sourceGraph = {...graph, id: 'a', dataLabels: {enabled: true, padding: 0}};
            const data = {timeline: [1, 2, 3, 4, 5], graphs: [sourceGraph]};
            const original = structuredClone(data);
            sourceGraph._data?.forEach(Object.freeze);
            Object.freeze(sourceGraph._data);
            Object.freeze(sourceGraph.data);
            Object.freeze(sourceGraph.dataLabels);
            Object.freeze(sourceGraph);

            const config = shapeYagrConfig({data, libraryConfig: {}, theme: 'light'});

            expect(config.series[0]).toMatchObject({
                ...sourceGraph,
                data: expected,
            });
            expect(data).toEqual(original);
            expect(config.series[0]).not.toBe(sourceGraph);
            expect(config.series[0].data).not.toBe(sourceGraph.data);
        });

        test('assigns unique ids without colliding with consumer ids or names', () => {
            const graphs: YagrGraph[] = [
                {data: [10]},
                {id: 'chartkit-series-0', data: [20]},
                {name: 'Named', _data: [{value: 10, label: 'Plan'}]},
                {name: 'Named', _data: [{value: 30, label: 'Actual'}]},
                {name: 'Explicit', data: [40]},
                {id: 'Explicit', data: [50]},
                {name: 'chartkit-series-3', data: [60]},
            ];
            const originalGraphs = structuredClone(graphs);
            const config = shapeYagrConfig({
                data: {timeline: [1], graphs},
                libraryConfig: {},
                theme: 'light',
            });

            expect(new Set(config.series.map((series) => series.id)).size).toBe(graphs.length);
            expect(config.series[1].id).toBe('chartkit-series-0');
            expect(config.series[2].id).toBe('Named');
            expect(config.series[5].id).toBe('Explicit');
            expect(config.series[6].id).toBe('chartkit-series-3');
            expect(graphs).toEqual(originalGraphs);
        });

        test('preserves caller plugins and handlers', () => {
            const draw = vi.fn();
            const processed = vi.fn();
            const plugin = vi.fn(() => ({uplot: {hooks: {}}}));
            const editUplotOptions = vi.fn((options) => options);
            const libraryConfig = {
                plugins: {custom: plugin},
                hooks: {draw: [draw], processed: [processed]},
                editUplotOptions,
            };
            const config = shapeYagrConfig({data: DATA, libraryConfig, theme: 'light'});

            expect(config.plugins?.custom).toBe(plugin);
            expect(config.hooks?.draw).toContain(draw);
            expect(config.hooks?.processed).toContain(processed);
            expect(libraryConfig.hooks).toEqual({draw: [draw], processed: [processed]});

            const options = {width: 400, height: 300, series: []};
            expect(config.editUplotOptions?.(options)).toEqual(options);
            expect(editUplotOptions).toHaveBeenCalledOnce();
        });
    });

    describe('GetUplotTimezoneAligner', () => {
        test.each<[YagrChartOptions | undefined, string | undefined, number, number]>([
            // UTC
            [{}, 'UTC', 1706659878000, 1706649078000],
            // UTC + 1
            [{}, 'Europe/Belgrade', 1706659878000, 1706652678000],
            // UTC - 1
            [{}, 'America/Scoresbysund', 1706659878000, 1706645478000],
            // UTC + 4
            [{}, 'Asia/Muscat', 1706659878000, 1706663478000],
        ])(
            'should return timestamp with subtracted timezone diff',
            (chart, timeZone, timestamp, expectedResult) => {
                const uplotTimezoneAligener = getUplotTimezoneAligner(chart, timeZone);

                // timestamp is UTC Wed Jan 31 2024 00:11:18
                const result = uplotTimezoneAligener(timestamp);

                expect(result.getTime()).toEqual(expectedResult);
            },
        );
    });
});
