import {select, max} from 'd3';
import type {AxisDomain} from 'd3';
import get from 'lodash/get';

import type {
    BaseTextStyle,
    ChartKitWidgetData,
    ChartKitWidgetSeries,
} from '../../../../../types/widget-data';

import {formatAxisTickLabel, getDomainDataYBySeries} from '../../utils';

import type {PreparedAxis, PreparedChart} from './types';

const DEFAULT_AXIS_LABEL_FONT_SIZE = '11px';
const AXIS_WIDTH = 1;

const getHorisontalSvgTextDimensions = (args: {text: string; style?: Partial<BaseTextStyle>}) => {
    const {text, style} = args;
    const textSelection = select(document.body).append('text').text(text);
    const fontSize = get(style, 'fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE);
    let height = 0;

    if (fontSize) {
        textSelection.style('font-size', fontSize);
    }

    textSelection
        .each(function () {
            height = this.getBoundingClientRect().height;
        })
        .remove();

    return height;
};

const getAxisLabelMaxWidth = (args: {axis: PreparedAxis; series: ChartKitWidgetSeries[]}) => {
    const {axis, series} = args;
    let maxDomainValue: AxisDomain;
    let width = 0;

    switch (axis.type) {
        case 'category': {
            const yCatigories = get(axis, 'categories', [] as string[]);
            maxDomainValue = [...yCatigories].sort((c1, c2) => c2.length - c1.length)[0];
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

    const formattedValue = formatAxisTickLabel({
        axisType: axis.type,
        value: maxDomainValue,
        dateFormat: axis.labels.dateFormat,
        numberFormat: axis.labels.numberFormat,
    });

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
    const marginBottom =
        get(chart, 'margin.bottom', 0) +
        preparedXAxis.labels.padding +
        getHorisontalSvgTextDimensions({text: 'Tmp', style: preparedXAxis.labels.style});
    const marginLeft =
        get(chart, 'margin.left', AXIS_WIDTH) +
        preparedY1Axis.labels.padding +
        getAxisLabelMaxWidth({axis: preparedY1Axis, series});

    return {
        margin: {
            top: get(chart, 'margin.top', 0),
            right: get(chart, 'margin.right', 0),
            bottom: marginBottom,
            left: marginLeft,
        },
    };
};
