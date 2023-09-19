import type {ChartMargin} from '../../../../../types/widget-data';

import type {PreparedAxis, PreparedLegend} from '../../hooks';
import {
    formatAxisTickLabel,
    getClosestPointsRange,
    getHorisontalSvgTextHeight,
    getLabelsMaxHeight,
    getMaxTickCount,
    getTicksCount,
    getXAxisItems,
    hasOverlappingLabels,
    isAxisRelatedSeries,
} from '../../utils';
import {getBoundsWidth} from './utils';
import {createXScale, PreparedSeries} from '../../hooks';
import {AxisDomain, AxisScale} from 'd3';
import React from 'react';

export {getBoundsWidth} from './utils';

type Args = {
    width: number;
    height: number;
    margin: ChartMargin;
    preparedLegend: PreparedLegend;
    preparedXAxis: PreparedAxis;
    preparedYAxis: PreparedAxis[];
    preparedSeries: PreparedSeries[];
};

const getHeightOccupiedByXAxis = ({
    preparedXAxis,
    preparedSeries,
    width,
}: {
    preparedXAxis: PreparedAxis;
    preparedSeries: PreparedSeries[];
    width: number;
}) => {
    let height = preparedXAxis.title.height;

    if (preparedXAxis.labels.enabled) {
        const scale = createXScale(preparedXAxis, preparedSeries, width);
        const tickCount = getTicksCount({axis: preparedXAxis, range: width});
        const ticks = getXAxisItems({
            scale: scale as AxisScale<AxisDomain>,
            count: tickCount,
            maxCount: getMaxTickCount({width, axis: preparedXAxis}),
        });
        const step = getClosestPointsRange(preparedXAxis, ticks);
        const labels = ticks.map((value: AxisDomain) => {
            return formatAxisTickLabel({
                axis: preparedXAxis,
                value,
                step,
            });
        });
        const overlapping = hasOverlappingLabels({
            width,
            labels,
            padding: preparedXAxis.labels.padding,
            style: preparedXAxis.labels.style,
        });

        const labelsHeight = overlapping
            ? getLabelsMaxHeight({
                  labels,
                  style: preparedXAxis.labels.style,
                  transform: 'rotate(-45)',
              })
            : getHorisontalSvgTextHeight({text: 'Tmp', style: preparedXAxis.labels.style});
        height += preparedXAxis.labels.margin + labelsHeight;
    }

    return height;
};

const getBottomOffset = (args: {
    hasAxisRelatedSeries: boolean;
    preparedLegend: PreparedLegend;
    preparedXAxis: PreparedAxis;
    preparedSeries: PreparedSeries[];
    width: number;
}) => {
    const {hasAxisRelatedSeries, preparedLegend, preparedXAxis, preparedSeries, width} = args;
    let result = 0;

    if (preparedLegend.enabled) {
        result += preparedLegend.height + preparedLegend.margin;
    }

    if (hasAxisRelatedSeries) {
        result += getHeightOccupiedByXAxis({preparedXAxis, preparedSeries, width});
    }

    return result;
};

export const useChartDimensions = (args: Args) => {
    const {margin, width, height, preparedLegend, preparedXAxis, preparedYAxis, preparedSeries} =
        args;

    return React.useMemo(() => {
        const hasAxisRelatedSeries = preparedSeries.some(isAxisRelatedSeries);
        const boundsWidth = getBoundsWidth({chartWidth: width, chartMargin: margin, preparedYAxis});
        const bottomOffset = getBottomOffset({
            hasAxisRelatedSeries,
            preparedLegend,
            preparedXAxis,
            preparedSeries,
            width: boundsWidth,
        });

        const boundsHeight = height - margin.top - margin.bottom - bottomOffset;

        return {boundsWidth, boundsHeight};
    }, [margin, width, height, preparedLegend, preparedXAxis, preparedYAxis, preparedSeries]);
};
