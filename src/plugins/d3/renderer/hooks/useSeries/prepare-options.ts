import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import type {ChartKitWidgetSeriesOptions} from '../../../../../types/widget-data';

import {seriesOptionsDefaults} from '../../constants';
import type {PreparedSeriesOptions} from './types';

export const getPreparedOptions = (
    options?: ChartKitWidgetSeriesOptions,
): PreparedSeriesOptions => {
    const defaultOptions = cloneDeep(seriesOptionsDefaults);
    return merge(defaultOptions, options);
};
