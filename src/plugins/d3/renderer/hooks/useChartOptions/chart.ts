import {select, max} from 'd3';
import type {AxisDomain} from 'd3';
import get from 'lodash/get';

import type {ChartKitWidgetData, ChartKitWidgetSeries} from '../../../../../types/widget-data';

import {
    isAxisRelatedSeries,
    formatAxisTickLabel,
    getDomainDataYBySeries,
    getHorisontalSvgTextHeight,
} from '../../utils';
import type {PreparedAxis, PreparedChart, PreparedTitle} from './types';

const AXIS_LINE_WIDTH = 1;

const getAxisLabelMaxWidth = (args: {axis: PreparedAxis; series: ChartKitWidgetSeries[]}) => {
    const {axis, series} = args;
    let maxDomainValue: AxisDomain;
    let width = 0;

    switch (axis.type) {
        case 'category': {
            const yCategories = get(axis, 'categories', [] as string[]);
            maxDomainValue = [...yCategories].sort((c1, c2) => c2.length - c1.length)[0];
            break;
        }
        case 'datetime': {
            const yTimestamps = get(axis, 'timestamps');
            const domain = yTimestamps || (getDomainDataYBySeries(series) as number[]);
            maxDomainValue = max(domain) as number;
            break;
        }
        case 'linear': {
            const domain = getDomainDataYBySeries(series) as number[];
            maxDomainValue = max(domain) as number;
            // maxDomainValue (sometimes) is not the largest value in domain cause of using .nice() method
            (maxDomainValue as number) *= 10;
        }
    }

    let formattedValue = '';

    if (axis.labels.enabled) {
        formattedValue = formatAxisTickLabel({
            axisType: axis.type,
            value: maxDomainValue,
            dateFormat: axis.labels['dateFormat'],
            numberFormat: axis.labels['numberFormat'],
        });
    }

    select(document.body)
        .append('text')
        .style('font-size', axis.labels.style.fontSize)
        .text(formattedValue)
        .each(function () {
            width = this.getBoundingClientRect().width;
        })
        .remove();

    return width;
};

const getMarginTop = (args: {
    chart: ChartKitWidgetData['chart'];
    hasAxisRelatedSeries: boolean;
    preparedY1Axis: PreparedAxis;
    preparedTitle?: PreparedTitle;
}) => {
    const {chart, hasAxisRelatedSeries, preparedY1Axis, preparedTitle} = args;
    let marginTop = get(chart, 'margin.top', 0);

    if (hasAxisRelatedSeries) {
        marginTop +=
            getHorisontalSvgTextHeight({text: 'Tmp', style: preparedY1Axis.labels.style}) / 2;
    }

    if (preparedTitle?.height) {
        marginTop += preparedTitle.height;
    }

    return marginTop;
};

const getMarginLeft = (args: {
    chart: ChartKitWidgetData['chart'];
    hasAxisRelatedSeries: boolean;
    series: ChartKitWidgetData['series'];
    preparedY1Axis: PreparedAxis;
}) => {
    const {chart, hasAxisRelatedSeries, series, preparedY1Axis} = args;
    let marginLeft = get(chart, 'margin.left', 0);

    if (hasAxisRelatedSeries) {
        marginLeft +=
            AXIS_LINE_WIDTH +
            preparedY1Axis.labels.padding +
            getAxisLabelMaxWidth({axis: preparedY1Axis, series: series.data}) +
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
    preparedXAxis: PreparedAxis;
    preparedY1Axis: PreparedAxis;
    preparedTitle?: PreparedTitle;
}): PreparedChart => {
    const {chart, series, preparedXAxis, preparedY1Axis, preparedTitle} = args;
    const hasAxisRelatedSeries = series.data.some(isAxisRelatedSeries);
    const marginTop = getMarginTop({chart, hasAxisRelatedSeries, preparedY1Axis, preparedTitle});
    const marginBottom = get(chart, 'margin.bottom', 0);
    const marginLeft = getMarginLeft({chart, hasAxisRelatedSeries, series, preparedY1Axis});
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
