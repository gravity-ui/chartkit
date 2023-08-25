import {select, max} from 'd3';
import type {AxisDomain} from 'd3';
import get from 'lodash/get';

import type {ChartKitWidgetData, ChartKitWidgetSeries} from '../../../../../types/widget-data';

import {formatAxisTickLabel, getDomainDataYBySeries, isAxisRelatedSeries} from '../../utils';

import type {PreparedAxis, PreparedChart} from './types';
import {getHorisontalSvgTextDimensions} from './utils';

const AXIS_WIDTH = 1;

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

export const getPreparedChart = (args: {
    chart: ChartKitWidgetData['chart'];
    series: ChartKitWidgetData['series'];
    preparedXAxis: PreparedAxis;
    preparedY1Axis: PreparedAxis;
}): PreparedChart => {
    const {chart, series, preparedXAxis, preparedY1Axis} = args;
    const hasAxisRelatedSeries = series.data.some(isAxisRelatedSeries);
    let marginBottom = get(chart, 'margin.bottom', 0);
    let marginLeft = get(chart, 'margin.left', 0);
    let marginTop = get(chart, 'margin.top', 0);
    let marginRight = get(chart, 'margin.right', 0);

    if (hasAxisRelatedSeries) {
        marginBottom +=
            preparedXAxis.labels.padding +
            getHorisontalSvgTextDimensions({text: 'Tmp', style: preparedXAxis.labels.style});
        marginLeft +=
            AXIS_WIDTH +
            preparedY1Axis.labels.padding +
            getAxisLabelMaxWidth({axis: preparedY1Axis, series: series.data}) +
            (preparedY1Axis.title.height || 0);
        marginTop +=
            getHorisontalSvgTextDimensions({text: 'Tmp', style: preparedY1Axis.labels.style}) / 2;
        marginRight += getAxisLabelMaxWidth({axis: preparedXAxis, series: series.data}) / 2;
    }

    return {
        margin: {
            top: marginTop,
            right: marginRight,
            bottom: marginBottom,
            left: marginLeft,
        },
    };
};
