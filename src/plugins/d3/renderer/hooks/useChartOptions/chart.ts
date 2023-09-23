import get from 'lodash/get';

import type {ChartKitWidgetData} from '../../../../../types';

import {isAxisRelatedSeries} from '../../utils';
import type {PreparedAxis, PreparedChart, PreparedTitle} from './types';

const AXIS_LINE_WIDTH = 1;

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

const getMarginLeft = (args: {
    chart: ChartKitWidgetData['chart'];
    hasAxisRelatedSeries: boolean;
    preparedY1Axis: PreparedAxis;
}) => {
    const {chart, hasAxisRelatedSeries, preparedY1Axis} = args;
    let marginLeft = get(chart, 'margin.left', 0);

    if (hasAxisRelatedSeries) {
        marginLeft +=
            AXIS_LINE_WIDTH +
            preparedY1Axis.labels.margin +
            (preparedY1Axis.labels.maxWidth || 0) +
            preparedY1Axis.title.height;
    }

    return marginLeft;
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
    const {chart, series, preparedY1Axis, preparedTitle} = args;
    const hasAxisRelatedSeries = series.data.some(isAxisRelatedSeries);
    const marginTop = getMarginTop({chart, preparedTitle});
    const marginBottom = get(chart, 'margin.bottom', 0);
    const marginLeft = getMarginLeft({chart, hasAxisRelatedSeries, preparedY1Axis});
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
