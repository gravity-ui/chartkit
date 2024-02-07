import {shapeYagrConfig, getUplotTimezoneAligner} from '../renderer/utils';
import type {YagrWidgetData, MinimalValidConfig} from '../types';
import type {YagrChartOptions} from '@gravity-ui/yagr';

const DATA: YagrWidgetData['data'] = {
    timeline: [1],
    graphs: [{data: [45]}],
};

jest.mock('@gravity-ui/date-utils', () => {
    const originalModule = jest.requireActual('@gravity-ui/date-utils');
    return {
        __esModule: true,
        ...originalModule,
        dateTime: ({input, timeZone}: {input: number; timeZone?: string}) => {
            const originalModule = jest.requireActual('@gravity-ui/date-utils');
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

    describe('GetUplotTimezoneAligner', () => {
        test.each<[YagrChartOptions | undefined, string | undefined, number, number]>([
            // UTC
            [{}, 'UTC', 1706659878000, 1706670678000],
            // UTC + 1
            [{}, 'Europe/Belgrade', 1706659878000, 1706667078000],
            // UTC - 1
            [{}, 'America/Scoresbysund', 1706659878000, 1706674278000],
            [{}, 'Asia/Muscat', 1706659878000, 1706656278000],
        ])(
            'should return timestamp with added timezone diff',
            (chart, timeZone, timestamp, expectedResult) => {
                const uplotTimezoneAligener = getUplotTimezoneAligner(chart, timeZone);

                // timestamp is UTC Wed Jan 31 2024 00:11:18
                const result = uplotTimezoneAligener(timestamp);

                expect(result.getTime()).toEqual(expectedResult);
            },
        );
    });
});
