import get from 'lodash/get';

import type {ChartKitWidgetData} from '../../../../../types';

import type {PreparedAxis, PreparedChart, PreparedTitle} from './types';

const getMarginTop = (args: {
    chart: ChartKitWidgetData['chart'];
    preparedTitle?: PreparedTitle;
}) => {
    const {chart, preparedTitle} = args;
    let marginTop = get(chart, 'margin.top', 0);

    if (preparedTitle?.height) {
        marginTop += preparedTitle.height;
    }

    return marginTop;
};

const getMarginRight = (args: {chart: ChartKitWidgetData['chart']}) => {
    const {chart} = args;

    return get(chart, 'margin.right', 0);
};

export const getPreparedChart = (args: {
    chart: ChartKitWidgetData['chart'];
    series: ChartKitWidgetData['series'];
    preparedY1Axis: PreparedAxis;
    preparedTitle?: PreparedTitle;
}): PreparedChart => {
    const {chart, preparedTitle} = args;
    const marginTop = getMarginTop({chart, preparedTitle});
    const marginBottom = get(chart, 'margin.bottom', 0);
    const marginLeft = get(chart, 'margin.left', 0);
    const marginRight = getMarginRight({chart});

    return {
        margin: {
            top: marginTop,
            right: marginRight,
            bottom: marginBottom,
            left: marginLeft,
        },
    };
};
