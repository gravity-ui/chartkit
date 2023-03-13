import {prepareData} from '../renderer/helpers/prepare-data';
import {data} from '../mocks/line';
import {ConfigOptions} from '../renderer/helpers/types';

describe('plugins/highcharts/helpers', () => {
    describe('prepareData', () => {
        it('should not throw an error', () => {
            expect(() => prepareData(data.data, data.config)).not.toThrowError();
        });

        it('should throw an error', () => {
            const configWithLinesLimit: Partial<ConfigOptions> = {
                ...data.config,
                linesLimit: 1,
            };
            expect(() => prepareData(data.data, configWithLinesLimit)).toThrowError();
        });
    });
});
