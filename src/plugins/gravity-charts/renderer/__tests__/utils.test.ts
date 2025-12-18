import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import type {ChartKitProps} from '../../../../types';
import {vaildateData} from '../utils';

const BASIC_PROPS: ChartKitProps<'gravity-charts'> = {
    data: {
        series: {
            data: [
                {data: [{x: 0, y: 0}], name: 'Line 1', type: 'line'},
                {data: [{x: 1, y: 1}], name: 'Line 2', type: 'line'},
            ],
        },
    },
    type: 'gravity-charts',
};

describe('plugins/gravity-charts/utils', () => {
    describe('validateData', () => {
        it('should not throw an error without series count limit', () => {
            expect(() => vaildateData(BASIC_PROPS)).not.toThrowError();
        });
        it('should not throw an error with sufficient series count limit', () => {
            const result = merge(cloneDeep(BASIC_PROPS), {
                validation: {seriesCountLimit: 3},
            });
            expect(() => vaildateData(result)).not.toThrowError();
        });
        it('should throw an error with insufficient series count limit', () => {
            const result = merge(cloneDeep(BASIC_PROPS), {
                validation: {seriesCountLimit: 1},
            });
            expect(() => vaildateData(result)).toThrowError();
        });
    });
});
