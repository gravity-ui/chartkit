import type {AxisDomain, AxisScale} from 'd3';
import get from 'lodash/get';

import type {BaseTextStyle, ChartKitWidgetData, ChartKitWidgetSeries} from '../../../../../types';
import {
    axisLabelsDefaults,
    DEFAULT_AXIS_LABEL_FONT_SIZE,
    yAxisTitleDefaults,
} from '../../constants';
import {
    getHorisontalSvgTextHeight,
    formatAxisTickLabel,
    getClosestPointsRange,
    getScaleTicks,
    getLabelsMaxWidth,
} from '../../utils';
import type {PreparedAxis} from './types';
import {createYScale} from '../useAxisScales';
import {PreparedSeries} from '../useSeries/types';

const getAxisLabelMaxWidth = (args: {axis: PreparedAxis; series: ChartKitWidgetSeries[]}) => {
    const {axis, series} = args;

    if (!axis.labels.enabled) {
        return 0;
    }

    const scale = createYScale(axis, series as PreparedSeries[], 1);
    const ticks: AxisDomain[] = getScaleTicks(scale as AxisScale<AxisDomain>);

    // FIXME: it is necessary to filter data, since we do not draw overlapping ticks

    const step = getClosestPointsRange(axis, ticks);
    const labels = (ticks as (string | number)[]).map((tick) =>
        formatAxisTickLabel({
            axis,
            value: tick,
            step,
        }),
    );

    return getLabelsMaxWidth({
        labels,
        style: {
            'font-size': axis.labels.style.fontSize,
            'font-weight': axis.labels.style.fontWeight || '',
        },
        rotation: axis.labels.rotation,
    });
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
    const labelsEnabled = get(yAxis1, 'labels.enabled', true);

    const y1LabelsStyle: BaseTextStyle = {
        fontSize: get(yAxis1, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
    };
    const y1TitleText = get(yAxis1, 'title.text', '');
    const y1TitleStyle: BaseTextStyle = {
        fontSize: get(yAxis1, 'title.style.fontSize', yAxisTitleDefaults.fontSize),
    };
    const preparedY1Axis: PreparedAxis = {
        type: get(yAxis1, 'type', 'linear'),
        labels: {
            enabled: labelsEnabled,
            margin: labelsEnabled ? get(yAxis1, 'labels.margin', axisLabelsDefaults.margin) : 0,
            padding: labelsEnabled ? get(yAxis1, 'labels.padding', axisLabelsDefaults.padding) : 0,
            dateFormat: get(yAxis1, 'labels.dateFormat'),
            numberFormat: get(yAxis1, 'labels.numberFormat'),
            style: y1LabelsStyle,
            rotation: get(yAxis1, 'labels.rotation', 0),
            width: 0,
            height: 0,
            lineHeight: getHorisontalSvgTextHeight({text: 'TmpLabel', style: y1LabelsStyle}),
            maxWidth: get(yAxis1, 'labels.maxWidth', axisLabelsDefaults.maxWidth),
        },
        lineColor: get(yAxis1, 'lineColor'),
        categories: get(yAxis1, 'categories'),
        timestamps: get(yAxis1, 'timestamps'),
        title: {
            text: y1TitleText,
            margin: get(yAxis1, 'title.margin', yAxisTitleDefaults.margin),
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

    if (labelsEnabled) {
        preparedY1Axis.labels.width = getAxisLabelMaxWidth({axis: preparedY1Axis, series});
    }

    return [preparedY1Axis];
};
