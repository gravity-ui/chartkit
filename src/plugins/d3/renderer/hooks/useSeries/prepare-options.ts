import merge from 'lodash/merge';

import type {ChartKitWidgetSeriesOptions} from '../../../../../types/widget-data';

import {seriesOptionsDefaults} from '../../constants';
import type {PreparedSeriesOptions} from './types';

export const getPreparedOptions = (
    options?: ChartKitWidgetSeriesOptions,
): PreparedSeriesOptions => {
    return merge({}, seriesOptionsDefaults, options);
};
