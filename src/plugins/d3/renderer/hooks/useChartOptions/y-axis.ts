import get from 'lodash/get';

import type {BaseTextStyle, ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedAxis} from './types';
import {
    DEFAULT_AXIS_LABEL_FONT_SIZE,
    DEFAULT_AXIS_LABEL_PADDING,
    DEFAULT_AXIS_TITLE_FONT_SIZE,
} from './constants';
import {getHorisontalSvgTextDimensions} from './utils';

export const getPreparedYAxis = ({yAxis}: {yAxis: ChartKitWidgetData['yAxis']}): PreparedAxis[] => {
    // FIXME: add support for n axises
    const yAxis1 = yAxis?.[0];

    const y1LabelsStyle: BaseTextStyle = {
        fontSize: get(yAxis1, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
    };
    const y1TitleText = get(yAxis1, 'title.text', '');
    const y1TitleStyle: BaseTextStyle = {
        fontSize: get(yAxis1, 'title.style.fontSize', DEFAULT_AXIS_TITLE_FONT_SIZE),
    };
    const preparedY1Axis: PreparedAxis = {
        type: get(yAxis1, 'type', 'linear'),
        labels: {
            enabled: get(yAxis1, 'labels.enabled', true),
            padding: get(yAxis1, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING),
            dateFormat: get(yAxis1, 'labels.dateFormat'),
            numberFormat: get(yAxis1, 'labels.numberFormat'),
            style: y1LabelsStyle,
        },
        categories: get(yAxis1, 'categories'),
        timestamps: get(yAxis1, 'timestamps'),
        title: {
            text: y1TitleText,
            style: y1TitleStyle,
            height: y1TitleText
                ? getHorisontalSvgTextDimensions({text: y1TitleText, style: y1TitleStyle})
                : 0,
        },
        min: get(yAxis1, 'min'),
        maxPadding: get(yAxis1, 'maxPadding', 0.05),
        grid: {
            enabled: get(yAxis1, 'grid.enabled', true),
        },
    };

    return [preparedY1Axis];
};
