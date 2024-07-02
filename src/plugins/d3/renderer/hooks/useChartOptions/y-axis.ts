import type {AxisDomain, AxisScale} from 'd3';
import get from 'lodash/get';

import type {BaseTextStyle, ChartKitWidgetSeries, ChartKitWidgetYAxis} from '../../../../../types';
import {
    DEFAULT_AXIS_LABEL_FONT_SIZE,
    DEFAULT_AXIS_TYPE,
    axisLabelsDefaults,
    yAxisTitleDefaults,
} from '../../constants';
import {
    CHART_SERIES_WITH_VOLUME_ON_Y_AXIS,
    formatAxisTickLabel,
    getClosestPointsRange,
    getHorisontalSvgTextHeight,
    getLabelsSize,
    getScaleTicks,
    getWaterfallPointSubtotal,
} from '../../utils';
import {createYScale} from '../useAxisScales';
import type {PreparedSeries, PreparedWaterfallSeries} from '../useSeries/types';

import type {PreparedAxis} from './types';

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

    return getLabelsSize({
        labels,
        style: axis.labels.style,
        rotation: axis.labels.rotation,
    }).maxWidth;
};

function getAxisMin(axis?: ChartKitWidgetYAxis, series?: ChartKitWidgetSeries[]) {
    const min = axis?.min;

    if (
        typeof min === 'undefined' &&
        series?.some((s) => CHART_SERIES_WITH_VOLUME_ON_Y_AXIS.includes(s.type))
    ) {
        return series.reduce((minValue, s) => {
            switch (s.type) {
                case 'waterfall': {
                    const minSubTotal = s.data.reduce(
                        (res, d) =>
                            Math.min(
                                res,
                                getWaterfallPointSubtotal(d, s as PreparedWaterfallSeries) || 0,
                            ),
                        0,
                    );
                    return Math.min(minValue, minSubTotal);
                }
                default: {
                    const minYValue = s.data.reduce((res, d) => Math.min(res, get(d, 'y', 0)), 0);
                    return Math.min(minValue, minYValue);
                }
            }
        }, 0);
    }

    return min;
}

export const getPreparedYAxis = ({
    series,
    yAxis,
}: {
    series: ChartKitWidgetSeries[];
    yAxis: ChartKitWidgetYAxis[] | undefined;
}): PreparedAxis[] => {
    const axisByPlot: ChartKitWidgetYAxis[][] = [];
    const axisItems = yAxis || [{} as ChartKitWidgetYAxis];
    return axisItems.map((axisItem) => {
        const plotIndex = get(axisItem, 'plotIndex', 0);
        const firstPlotAxis = !axisByPlot[plotIndex];
        if (firstPlotAxis) {
            axisByPlot[plotIndex] = [];
        }
        axisByPlot[plotIndex].push(axisItem);
        const defaultAxisPosition = firstPlotAxis ? 'left' : 'right';

        const labelsEnabled = get(axisItem, 'labels.enabled', true);

        const labelsStyle: BaseTextStyle = {
            fontSize: get(axisItem, 'labels.style.fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE),
        };
        const titleText = get(axisItem, 'title.text', '');
        const titleStyle: BaseTextStyle = {
            fontSize: get(axisItem, 'title.style.fontSize', yAxisTitleDefaults.fontSize),
        };
        const titleSize = getLabelsSize({labels: [titleText], style: titleStyle});
        const axisType = get(axisItem, 'type', DEFAULT_AXIS_TYPE);
        const preparedAxis: PreparedAxis = {
            type: axisType,
            labels: {
                enabled: labelsEnabled,
                margin: labelsEnabled
                    ? get(axisItem, 'labels.margin', axisLabelsDefaults.margin)
                    : 0,
                padding: labelsEnabled
                    ? get(axisItem, 'labels.padding', axisLabelsDefaults.padding)
                    : 0,
                dateFormat: get(axisItem, 'labels.dateFormat'),
                numberFormat: get(axisItem, 'labels.numberFormat'),
                style: labelsStyle,
                rotation: get(axisItem, 'labels.rotation', 0),
                width: 0,
                height: 0,
                lineHeight: getHorisontalSvgTextHeight({text: 'TmpLabel', style: labelsStyle}),
                maxWidth: get(axisItem, 'labels.maxWidth', axisLabelsDefaults.maxWidth),
            },
            lineColor: get(axisItem, 'lineColor'),
            categories: get(axisItem, 'categories'),
            timestamps: get(axisItem, 'timestamps'),
            title: {
                text: titleText,
                margin: get(axisItem, 'title.margin', yAxisTitleDefaults.margin),
                style: titleStyle,
                width: titleSize.maxWidth,
                height: titleSize.maxHeight,
                align: get(axisItem, 'title.align', yAxisTitleDefaults.align),
            },
            min: getAxisMin(axisItem, series),
            maxPadding: get(axisItem, 'maxPadding', 0.05),
            grid: {
                enabled: get(axisItem, 'grid.enabled', firstPlotAxis),
            },
            ticks: {
                pixelInterval: get(axisItem, 'ticks.pixelInterval'),
            },
            position: get(axisItem, 'position', defaultAxisPosition),
            plotIndex: get(axisItem, 'plotIndex', 0),
        };

        if (labelsEnabled) {
            preparedAxis.labels.width = getAxisLabelMaxWidth({axis: preparedAxis, series});
        }

        return preparedAxis;
    });
};
