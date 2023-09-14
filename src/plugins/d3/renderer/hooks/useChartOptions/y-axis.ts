import {select, max} from 'd3';
import type {AxisDomain} from 'd3';
import get from 'lodash/get';

import type {
    BaseTextStyle,
    ChartKitWidgetData,
    ChartKitWidgetSeries,
} from '../../../../../types/widget-data';

import {
    DEFAULT_AXIS_LABEL_FONT_SIZE,
    DEFAULT_AXIS_LABEL_PADDING,
    DEFAULT_AXIS_TITLE_FONT_SIZE,
} from '../../constants';
import {getDomainDataYBySeries, getHorisontalSvgTextHeight, formatAxisTickLabel} from '../../utils';
import type {PreparedAxis} from './types';

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

const applyLabelsMaxWidth = (args: {
    series: ChartKitWidgetSeries[];
    preparedYAxis: PreparedAxis;
}) => {
    const {series, preparedYAxis} = args;
    const maxWidth = getAxisLabelMaxWidth({axis: preparedYAxis, series});
    preparedYAxis.labels.maxWidth = maxWidth;
};

export const getPreparedYAxis = ({
    series,
    yAxis,
}: {
    series: ChartKitWidgetSeries[];
    yAxis: ChartKitWidgetData['yAxis'];
}): PreparedAxis[] => {
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
        lineColor: get(yAxis1, 'lineColor'),
        categories: get(yAxis1, 'categories'),
        timestamps: get(yAxis1, 'timestamps'),
        title: {
            text: y1TitleText,
            style: y1TitleStyle,
            height: y1TitleText
                ? getHorisontalSvgTextHeight({text: y1TitleText, style: y1TitleStyle})
                : 0,
        },
        min: get(yAxis1, 'min'),
        maxPadding: get(yAxis1, 'maxPadding', 0.05),
        grid: {
            enabled: get(yAxis1, 'grid.enabled', true),
        },
        ticks: {
            pixelInterval: get(yAxis1, 'ticks.pixelInterval'),
        },
    };

    applyLabelsMaxWidth({series, preparedYAxis: preparedY1Axis});

    return [preparedY1Axis];
};
