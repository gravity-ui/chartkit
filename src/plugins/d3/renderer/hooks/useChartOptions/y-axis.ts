import {select, ScaleLinear, AxisDomain} from 'd3';
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
import {getHorisontalSvgTextHeight, formatAxisTickLabel, getClosestPointsRange} from '../../utils';
import type {PreparedAxis} from './types';
import {createYScale} from '../useAxisScales';
import {PreparedSeries} from '../useSeries/types';

const getAxisLabelMaxWidth = (args: {axis: PreparedAxis; series: ChartKitWidgetSeries[]}) => {
    const {axis, series} = args;

    if (!axis.labels.enabled) {
        return 0;
    }

    const scale = createYScale(axis, series as PreparedSeries[], 1);
    const ticks: AxisDomain[] =
        axis.type === 'category'
            ? axis.categories || []
            : (scale as ScaleLinear<number, number>).ticks();

    // ToDo: it is necessary to filter data, since we do not draw overlapping ticks

    const step = getClosestPointsRange(axis, ticks);
    const svg = select(document.body).append('svg');
    const text = svg.append('g').append('text').style('font-size', axis.labels.style.fontSize);
    text.selectAll('tspan')
        .data(ticks as (string | number)[])
        .enter()
        .append('tspan')
        .attr('x', 0)
        .attr('dy', 0)
        .text((d) => {
            return formatAxisTickLabel({
                axis,
                value: d,
                step,
            });
        });

    const maxWidth = (text.node() as SVGTextElement).getBoundingClientRect()?.width || 0;
    svg.remove();

    return maxWidth;
};

const applyLabelsMaxWidth = (args: {
    series: ChartKitWidgetSeries[];
    preparedYAxis: PreparedAxis;
}) => {
    const {series, preparedYAxis} = args;

    preparedYAxis.labels.maxWidth = getAxisLabelMaxWidth({axis: preparedYAxis, series});
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
