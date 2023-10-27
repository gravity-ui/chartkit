import get from 'lodash/get';
import type {AxisDomain, AxisScale} from 'd3';
import type {BaseTextStyle, ChartKitWidgetSeries, ChartKitWidgetAxis} from '../../../../../types';
import {
    axisLabelsDefaults,
    DEFAULT_AXIS_LABEL_FONT_SIZE,
    xAxisTitleDefaults,
} from '../../constants';
import type {PreparedAxis} from './types';
import {
    calculateCos,
    formatAxisTickLabel,
    getClosestPointsRange,
    getHorisontalSvgTextHeight,
    getLabelsSize,
    getMaxTickCount,
    getTicksCount,
    getXAxisItems,
    hasOverlappingLabels,
} from '../../utils';
import {createXScale} from '../useAxisScales';

function getLabelSettings({
    axis,
    series,
    width,
    autoRotation = true,
}: {
    axis: PreparedAxis;
    series: ChartKitWidgetSeries[];
    width: number;
    autoRotation?: boolean;
}) {
    const scale = createXScale(axis, series, width);
    const tickCount = getTicksCount({axis, range: width});
    const ticks = getXAxisItems({
        scale: scale as AxisScale<AxisDomain>,
        count: tickCount,
        maxCount: getMaxTickCount({width, axis}),
    });
    const step = getClosestPointsRange(axis, ticks);
    const labels = ticks.map((value: AxisDomain) => {
        return formatAxisTickLabel({
            axis,
            value,
            step,
        });
    });
    const overlapping = hasOverlappingLabels({
        width,
        labels,
        padding: axis.labels.padding,
        style: axis.labels.style,
    });

    const defaultRotation = overlapping && autoRotation ? -45 : 0;
    const rotation = axis.labels.rotation || defaultRotation;
    const labelsHeight = rotation
        ? getLabelsSize({
              labels,
              style: {
                  'font-size': axis.labels.style.fontSize,
                  'font-weight': axis.labels.style.fontWeight || 'normal',
              },
              rotation,
          }).maxHeight
        : axis.labels.lineHeight;
    const maxHeight = rotation ? calculateCos(rotation) * axis.labels.maxWidth : labelsHeight;

    return {height: Math.min(maxHeight, labelsHeight), rotation};
}

export const getPreparedXAxis = ({
    xAxis,
    series,
    width,
}: {
    xAxis?: ChartKitWidgetAxis;
    series: ChartKitWidgetSeries[];
    width: number;
}): PreparedAxis => {
    const titleText = get(xAxis, 'title.text', '');
    const titleStyle: BaseTextStyle = {
        fontSize: get(xAxis, 'title.style.fontSize', xAxisTitleDefaults.fontSize),
    };
    const labelsStyle = {
        fontSize: get(xAxis, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
    };

    const preparedXAxis: PreparedAxis = {
        type: get(xAxis, 'type', 'linear'),
        labels: {
            enabled: get(xAxis, 'labels.enabled', true),
            margin: get(xAxis, 'labels.margin', axisLabelsDefaults.margin),
            padding: get(xAxis, 'labels.padding', axisLabelsDefaults.padding),
            dateFormat: get(xAxis, 'labels.dateFormat'),
            numberFormat: get(xAxis, 'labels.numberFormat'),
            rotation: get(xAxis, 'labels.rotation', 0),
            style: labelsStyle,
            width: 0,
            height: 0,
            lineHeight: getHorisontalSvgTextHeight({text: 'Tmp', style: labelsStyle}),
            maxWidth: get(xAxis, 'labels.maxWidth', axisLabelsDefaults.maxWidth),
        },
        lineColor: get(xAxis, 'lineColor'),
        categories: get(xAxis, 'categories'),
        timestamps: get(xAxis, 'timestamps'),
        title: {
            text: titleText,
            style: titleStyle,
            margin: get(xAxis, 'title.margin', xAxisTitleDefaults.margin),
            height: titleText
                ? getHorisontalSvgTextHeight({text: titleText, style: titleStyle})
                : 0,
        },
        min: get(xAxis, 'min'),
        maxPadding: get(xAxis, 'maxPadding', 0.01),
        grid: {
            enabled: get(xAxis, 'grid.enabled', true),
        },
        ticks: {
            pixelInterval: get(xAxis, 'ticks.pixelInterval'),
        },
    };

    const {height, rotation} = getLabelSettings({
        axis: preparedXAxis,
        series,
        width,
        autoRotation: xAxis?.labels?.autoRotation,
    });

    preparedXAxis.labels.height = height;
    preparedXAxis.labels.rotation = rotation;

    return preparedXAxis;
};
