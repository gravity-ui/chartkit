// Regression tests for merging user options into the default options, as lodash's merge did.
//
// The defaults share objects between series types (`first` in options.js), and prepareConfig
// copies plotOptions.series.dataLabels into several types as one object. es-toolkit's merge reuses
// one result for such an object, so user options of one type reached the others; its mergeWith
// gave the customizer [] in place of a default axis object, so an axis array lost the defaults.
//
// These run in the browser (visual) project because prepareConfig needs `window`.

import {settings} from '../../../libs';
import {data as lineMock} from '../mocks/line';
import {prepareConfig} from '../renderer/helpers/config/config';

settings.set({lang: 'en'});

type PreparedConfig = {
    plotOptions: Record<
        string,
        {states?: {hover?: {lineWidthPlus?: number}}; dataLabels?: {color?: string}}
    >;
    yAxis: {gridLineColor?: string; opposite?: boolean; labels?: {formatter?: unknown}}[];
};

function build(highcharts: Record<string, unknown>) {
    return prepareConfig(lineMock.data, {highcharts}) as unknown as PreparedConfig;
}

describe('highcharts prepareConfig merges user options as lodash did', () => {
    test('options of one series type do not reach the types that share its defaults', () => {
        const config = build({plotOptions: {spline: {states: {hover: {lineWidthPlus: 5}}}}});

        expect(config.plotOptions.spline.states?.hover?.lineWidthPlus).toBe(5);
        expect(config.plotOptions.areaspline.states?.hover?.lineWidthPlus).toBe(1);
        expect(config.plotOptions.arearange.states?.hover?.lineWidthPlus).toBe(1);
    });

    test('data labels of one series type do not reach the other types', () => {
        const config = build({
            plotOptions: {
                series: {dataLabels: {enabled: true}},
                area: {dataLabels: {color: 'red'}},
            },
        });

        expect(config.plotOptions.area.dataLabels?.color).toBe('red');
        expect(config.plotOptions.bar.dataLabels?.color).toBeUndefined();
        expect(config.plotOptions.line.dataLabels?.color).toBeUndefined();
    });

    test('every axis of an axis array gets the default axis options', () => {
        const config = build({yAxis: [{}, {opposite: true}]});

        expect(config.yAxis).toHaveLength(2);
        for (const axis of config.yAxis) {
            expect(axis.gridLineColor).toBe('var(--highcharts-grid-line)');
            expect(typeof axis.labels?.formatter).toBe('function');
        }
        expect(config.yAxis[1].opposite).toBe(true);
    });
});
