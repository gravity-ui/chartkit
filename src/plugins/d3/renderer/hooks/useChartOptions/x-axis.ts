import get from 'lodash/get';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedAxis} from './types';
import {
    DEFAULT_AXIS_LABEL_FONT_SIZE,
    DEFAULT_AXIS_LABEL_PADDING,
    DEFAULT_AXIS_TITLE_FONT_SIZE,
} from './constants';
import {BaseTextStyle} from '../../../../../types/widget-data';
import {getHorisontalSvgTextDimensions} from './utils';

export const getPreparedXAxis = ({xAxis}: {xAxis: ChartKitWidgetData['xAxis']}): PreparedAxis => {
    const titleText = get(xAxis, 'title.text', '');
    const titleStyle: BaseTextStyle = {
        fontSize: get(xAxis, 'title.style.fontSize', DEFAULT_AXIS_TITLE_FONT_SIZE),
    };

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
        title: {
            text: titleText,
            style: titleStyle,
            height: titleText
                ? getHorisontalSvgTextDimensions({text: titleText, style: titleStyle})
                : 0,
        },
        min: get(xAxis, 'min'),
        maxPadding: get(xAxis, 'maxPadding', 0.01),
        grid: {
            enabled: get(xAxis, 'grid.enabled', true),
        },
        ticks: {
            pixelInterval: get(xAxis, 'ticks.pixelInterval'),
        },
    };

    return preparedXAxis;
};
