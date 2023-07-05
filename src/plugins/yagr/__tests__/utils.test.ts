import {shapeYagrConfig} from '../renderer/utils';
import type {MinimalValidConfig, YagrWidgetData} from '../types';

const DATA: YagrWidgetData['data'] = {
    timeline: [1],
    graphs: [{data: [45]}],
};

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
});
