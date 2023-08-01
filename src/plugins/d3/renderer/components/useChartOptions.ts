import React from 'react';
import {select, max} from 'd3';
import type {AxisDomain} from 'd3';
import get from 'lodash/get';

import type {
    ChartKitWidgetData,
    ChartKitWidgetAxis,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
    ChartKitWidgetLegend,
    ChartKitWidgetSeries,
    ChartMargin,
} from '../../../../types/widget-data';

import {formatAxisTickLabel, getDomainDataYBySeries} from './utils';

type AxisLabels = Omit<ChartKitWidgetAxisLabels, 'enabled' | 'padding' | 'style'> &
    Required<Pick<ChartKitWidgetAxisLabels, 'enabled' | 'padding'>> & {
        style: {
            fontSize: string;
        };
    };
type Axis = Omit<ChartKitWidgetAxis, 'type' | 'labels'> & {
    type: ChartKitWidgetAxisType;
    labels: AxisLabels;
};

export type ChartOptions = {
    chart: {
        margin: ChartMargin;
    };
    legend: Required<ChartKitWidgetLegend>;
    xAxis: Axis;
    yAxis: Axis[];
};

const DEFAULT_AXIS_LABEL_PADDING = 10;
const DEFAULT_FONT_SIZE = '11px';
const AXIS_WIDTH = 1;

const getXlabelHeight = () => {
    let height = 0;

    select(document.body)
        .append('text')
        .text('Tmp')
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
            maxDomainValue = yCatigories.sort()[yCatigories.length - 1];
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
    const {chart, series, legend, xAxis, yAxis} = args;

    const options: ChartOptions = React.useMemo(() => {
        // FIXME: add support for 2 axises
        const yAxis1 = yAxis?.[0];
        const xLabelPadding = get(xAxis, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING);
        const yLabelPadding = get(yAxis1, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING);
        const preparedY1Axis: Axis = {
            type: get(yAxis1, 'type', 'linear'),
            labels: {
                enabled: get(yAxis1, 'labels.enabled', true),
                padding: get(yAxis1, 'labels.padding', DEFAULT_AXIS_LABEL_PADDING),
                dateFormat: get(yAxis1, 'labels.dateFormat'),
                numberFormat: get(yAxis1, 'labels.numberFormat'),
                style: {
                    fontSize: get(yAxis1, 'labels.style.fontSize', DEFAULT_FONT_SIZE),
                },
            },
            categories: get(yAxis1, 'categories'),
            timestamps: get(yAxis1, 'timestamps'),
        };
        const preparedXAxis: Axis = {
            type: get(xAxis, 'type', 'linear'),
            labels: {
                enabled: get(xAxis, 'labels.enabled', true),
                padding: xLabelPadding,
                dateFormat: get(xAxis, 'labels.dateFormat'),
                numberFormat: get(xAxis, 'labels.numberFormat'),
                style: {
                    fontSize: get(xAxis, 'labels.style.fontSize', DEFAULT_FONT_SIZE),
                },
            },
            categories: get(xAxis, 'categories'),
            timestamps: get(xAxis, 'timestamps'),
        };
        const marginBottom = get(chart, 'margin.bottom', 0) + xLabelPadding + getXlabelHeight();
        const marginLeft =
            get(chart, 'margin.left', AXIS_WIDTH) +
            yLabelPadding +
            getAxisLabelMaxWidth({axis: preparedY1Axis, series});

        return {
            chart: {
                margin: {
                    top: get(chart, 'margin.top', 10),
                    right: get(chart, 'margin.right', 10),
                    bottom: marginBottom,
                    left: marginLeft,
                },
            },
            legend: {
                enabled: get(legend, 'enabled', true) && series.length > 1,
            },
            xAxis: preparedXAxis,
            yAxis: [preparedY1Axis],
        };
    }, [chart, legend, series, xAxis, yAxis]);

    return options;
};
