import {ChartKitPlugin} from 'src/types';

import {settings} from '../settings';

const resetSettings = () => settings.set({lang: 'en'});

const getMockedPlugin = (type: string, renderer: string) =>
    ({
        type,
        renderer,
    } as unknown as ChartKitPlugin);

// Order test is important because settings module is singleton and we can't delete plugins
describe('libs/settings update plugins', () => {
    it('Update plugins when it is empty', () => {
        settings.set({
            plugins: [getMockedPlugin('highcharts', 'initial'), getMockedPlugin('d3', 'initial')],
        });

        expect(settings.get('plugins')).toEqual([
            {
                type: 'highcharts',
                renderer: 'initial',
            },
            {
                type: 'd3',
                renderer: 'initial',
            },
        ]);
    });

    it('Update existing plugin d3', () => {
        const initial = settings.get('plugins');

        expect(initial).toEqual([
            {
                type: 'highcharts',
                renderer: 'initial',
            },
            {
                type: 'd3',
                renderer: 'initial',
            },
        ]);

        settings.set({
            plugins: [getMockedPlugin('d3', 'update')],
        });

        const result = settings.get('plugins');

        expect(result).toEqual([
            {
                type: 'highcharts',
                renderer: 'initial',
            },
            {
                type: 'd3',
                renderer: 'update',
            },
        ]);
    });

    it('Add new plugin', () => {
        settings.set({
            plugins: [getMockedPlugin('yagr', 'update')],
        });

        const result = settings.get('plugins');

        expect(result).toEqual([
            {
                type: 'highcharts',
                renderer: 'initial',
            },
            {
                type: 'd3',
                renderer: 'update',
            },
            {
                type: 'yagr',
                renderer: 'update',
            },
        ]);
    });

    beforeAll(resetSettings);
    afterEach(resetSettings);
});
