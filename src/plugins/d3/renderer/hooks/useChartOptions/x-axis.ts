import get from 'lodash/get';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedAxis} from './types';
import {DEFAULT_AXIS_LABEL_FONT_SIZE, DEFAULT_AXIS_LABEL_PADDING} from './constants';

export const getPreparedXAxis = ({xAxis}: {xAxis: ChartKitWidgetData['xAxis']}): PreparedAxis => {
    const preparedXAxis: PreparedAxis = {
        type: get(xAxis, 'type', 'linear'),
        labels: {
            enabled: get(xAxis, 'labels.enabled', true),
            padding: get(xAxis, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING),
            dateFormat: get(xAxis, 'labels.dateFormat'),
            numberFormat: get(xAxis, 'labels.numberFormat'),
            style: {fontSize: get(xAxis, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE)},
        },
        categories: get(xAxis, 'categories'),
        timestamps: get(xAxis, 'timestamps'),
    };

    return preparedXAxis;
};
