import get from 'lodash/get';

import type {BaseTextStyle, ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedAxis} from './types';

const DEFAULT_AXIS_LABEL_PADDING = 10;
const DEFAULT_AXIS_LABEL_FONT_SIZE = '11px';

export const getPreparedYAxis = ({yAxis}: {yAxis: ChartKitWidgetData['yAxis']}): PreparedAxis[] => {
    // FIXME: add support for n axises
    const yAxis1 = yAxis?.[0];
    const y1LabelsStyle: BaseTextStyle = {
        fontSize: get(yAxis1, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
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
    };

    return [preparedY1Axis];
};
