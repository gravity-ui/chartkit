import React from 'react';
import {select, max} from 'd3';
import type {AxisDomain} from 'd3';
import get from 'lodash/get';

import type {
    BaseTextStyle,
    ChartKitWidgetData,
    ChartKitWidgetAxis,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
    ChartKitWidgetLegend,
    ChartKitWidgetSeries,
    ChartMargin,
} from '../../../../../types/widget-data';

import {formatAxisTickLabel, getDomainDataYBySeries} from '../../utils';

type AxisLabels = Omit<ChartKitWidgetAxisLabels, 'enabled' | 'padding' | 'style'> &
    Required<Pick<ChartKitWidgetAxisLabels, 'enabled' | 'padding'>> & {
        style: BaseTextStyle;
    };
type Axis = Omit<ChartKitWidgetAxis, 'type' | 'labels'> & {
    type: ChartKitWidgetAxisType;
    labels: AxisLabels;
};
export type PreparedTitle = ChartKitWidgetData['title'] & {
    height: number;
};

export type ChartOptions = {
    chart: {
        margin: ChartMargin;
    };
    legend: Required<ChartKitWidgetLegend>;
    xAxis: Axis;
    yAxis: Axis[];
    title?: PreparedTitle;
};

const DEFAULT_AXIS_LABEL_PADDING = 10;
const DEFAULT_AXIS_LABEL_FONT_SIZE = '11px';
const DEFAULT_TITLE_FONT_SIZE = '15px';
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

const getAxisLabelMaxWidth = (args: {axis: Axis; series: ChartKitWidgetSeries[]}) => {
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

export const useChartOptions = (args: ChartKitWidgetData): ChartOptions => {
    const {chart, series, legend, title, xAxis, yAxis} = args;

    const options: ChartOptions = React.useMemo(() => {
        // FIXME: add support for 2 axises
        const yAxis1 = yAxis?.[0];
        const xLabelsPadding = get(xAxis, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING);
        const xLabelsStyle: BaseTextStyle = {
            fontSize: get(xAxis, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
        };
        const y1LabelsPadding = get(yAxis1, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING);
        const y1LabelsStyle: BaseTextStyle = {
            fontSize: get(yAxis1, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
        };
        const preparedY1Axis: Axis = {
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
        const preparedXAxis: Axis = {
            type: get(xAxis, 'type', 'linear'),
            labels: {
                enabled: get(xAxis, 'labels.enabled', true),
                padding: xLabelsPadding,
                dateFormat: get(xAxis, 'labels.dateFormat'),
                numberFormat: get(xAxis, 'labels.numberFormat'),
                style: xLabelsStyle,
            },
            categories: get(xAxis, 'categories'),
            timestamps: get(xAxis, 'timestamps'),
        };
        const titleText = get(title, 'text');
        const titleStyle: BaseTextStyle = {
            fontSize: get(title, 'style.fontSize', DEFAULT_TITLE_FONT_SIZE),
        };
        const titleHeight = titleText
            ? getHorisontalSvgTextDimensions({text: titleText, style: titleStyle})
            : 0;
        const preparedTitle: PreparedTitle | undefined = titleText
            ? {text: titleText, style: titleStyle, height: titleHeight}
            : undefined;
        const marginBottom =
            get(chart, 'margin.bottom', 0) +
            xLabelsPadding +
            getHorisontalSvgTextDimensions({text: 'Tmp', style: xLabelsStyle});
        const marginLeft =
            get(chart, 'margin.left', AXIS_WIDTH) +
            y1LabelsPadding +
            getAxisLabelMaxWidth({axis: preparedY1Axis, series});

        return {
            chart: {
                margin: {
                    // add margin by label height
                    top: get(chart, 'margin.top', 0),
                    right: get(chart, 'margin.right', 0),
                    bottom: marginBottom,
                    left: marginLeft,
                },
            },
            legend: {
                enabled: get(legend, 'enabled', true) && series.length > 1,
            },
            title: preparedTitle,
            xAxis: preparedXAxis,
            yAxis: [preparedY1Axis],
        };
    }, [chart, legend, title, series, xAxis, yAxis]);

    return options;
};
