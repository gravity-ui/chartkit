import React from 'react';
import {scaleBand, scaleLinear, scaleUtc, extent} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import type {ChartOptions, PreparedAxis} from '../useChartOptions/types';
import {
    getOnlyVisibleSeries,
    getDataCategoryValue,
    getDomainDataYBySeries,
    getDomainDataXBySeries,
    isAxisRelatedSeries,
    isSeriesWithCategoryValues,
} from '../../utils';
import type {AxisDirection} from '../../utils';
import {PreparedSeries} from '../useSeries/types';
import {ChartKitWidgetAxis, ChartKitWidgetSeries} from '../../../../../types';

export type ChartScale =
    | ScaleLinear<number, number>
    | ScaleBand<string>
    | ScaleTime<number, number>;

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    series: PreparedSeries[];
    xAxis: PreparedAxis;
    yAxis: ChartOptions['yAxis'];
};

type ReturnValue = {
    xScale?: ChartScale;
    yScale?: ChartScale;
};

const isNumericalArrayData = (data: unknown[]): data is number[] => {
    return data.every((d) => typeof d === 'number' || d === null);
};

const filterCategoriesByVisibleSeries = (args: {
    axisDirection: AxisDirection;
    categories: string[];
    series: (PreparedSeries | ChartKitWidgetSeries)[];
}) => {
    const {axisDirection, categories, series} = args;

    const visibleCategories = new Set();
    series.forEach((s) => {
        if (isSeriesWithCategoryValues(s)) {
            s.data.forEach((d) => {
                visibleCategories.add(getDataCategoryValue({axisDirection, categories, data: d}));
            });
        }
    });

    return categories.filter((c) => visibleCategories.has(c));
};

export function createYScale(axis: PreparedAxis, series: PreparedSeries[], boundsHeight: number) {
    const yType = get(axis, 'type', 'linear');
    const yMin = get(axis, 'min');
    const yCategories = get(axis, 'categories');
    const yTimestamps = get(axis, 'timestamps');

    switch (yType) {
        case 'linear': {
            const domain = getDomainDataYBySeries(series);
            const range = [boundsHeight, boundsHeight * axis.maxPadding];

            if (isNumericalArrayData(domain)) {
                const [domainYMin, yMax] = extent(domain) as [number, number];
                const yMinValue = typeof yMin === 'number' ? yMin : domainYMin;
                return scaleLinear().domain([yMinValue, yMax]).range(range).nice();
            }

            break;
        }
        case 'category': {
            if (yCategories) {
                const filteredCategories = filterCategoriesByVisibleSeries({
                    axisDirection: 'y',
                    categories: yCategories,
                    series: series,
                });
                return scaleBand().domain(filteredCategories).range([boundsHeight, 0]);
            }

            break;
        }
        case 'datetime': {
            const range = [boundsHeight, boundsHeight * axis.maxPadding];

            if (yTimestamps) {
                const [yMin, yMax] = extent(yTimestamps) as [number, number];
                return scaleUtc().domain([yMin, yMax]).range(range).nice();
            } else {
                const domain = getDomainDataYBySeries(series);

                if (isNumericalArrayData(domain)) {
                    const [yMin, yMax] = extent(domain) as [number, number];
                    return scaleUtc().domain([yMin, yMax]).range(range).nice();
                }
            }

            break;
        }
    }

    throw new Error('Failed to create yScale');
}

export function createXScale(
    axis: PreparedAxis | ChartKitWidgetAxis,
    series: (PreparedSeries | ChartKitWidgetSeries)[],
    boundsWidth: number,
) {
    const xMin = get(axis, 'min');
    const xType = get(axis, 'type', 'linear');
    const xCategories = get(axis, 'categories');
    const xTimestamps = get(axis, 'timestamps');
    const maxPadding = get(axis, 'maxPadding', 0);

    const xAxisMinPadding = boundsWidth * maxPadding;
    const xRange = [0, boundsWidth - xAxisMinPadding];

    switch (xType) {
        case 'linear': {
            const domain = getDomainDataXBySeries(series);

            if (isNumericalArrayData(domain)) {
                const [domainXMin, xMax] = extent(domain) as [number, number];
                const xMinValue = typeof xMin === 'number' ? xMin : domainXMin;
                return scaleLinear().domain([xMinValue, xMax]).range(xRange).nice();
            }

            break;
        }
        case 'category': {
            if (xCategories) {
                const filteredCategories = filterCategoriesByVisibleSeries({
                    axisDirection: 'x',
                    categories: xCategories,
                    series: series,
                });
                const xScale = scaleBand().domain(filteredCategories).range([0, boundsWidth]);

                if (xScale.step() / 2 < xAxisMinPadding) {
                    xScale.range(xRange);
                }

                return xScale;
            }

            break;
        }
        case 'datetime': {
            if (xTimestamps) {
                const [xMin, xMax] = extent(xTimestamps) as [number, number];
                return scaleUtc().domain([xMin, xMax]).range(xRange).nice();
            } else {
                const domain = getDomainDataXBySeries(series);

                if (isNumericalArrayData(domain)) {
                    const [xMin, xMax] = extent(domain) as [number, number];
                    return scaleUtc().domain([xMin, xMax]).range(xRange).nice();
                }
            }

            break;
        }
    }

    throw new Error('Failed to create xScale');
}

const createScales = (args: Args) => {
    const {boundsWidth, boundsHeight, series, xAxis, yAxis} = args;
    let visibleSeries = getOnlyVisibleSeries(series);
    // Reassign to all series in case of all series unselected,
    // otherwise we will get an empty space without grid
    visibleSeries = visibleSeries.length === 0 ? series : visibleSeries;

    return {
        xScale: createXScale(xAxis, visibleSeries, boundsWidth),
        yScale: createYScale(yAxis[0], visibleSeries, boundsHeight),
    };
};

/**
 * Uses to create scales for axis related series
 */
export const useAxisScales = (args: Args): ReturnValue => {
    const {boundsWidth, boundsHeight, series, xAxis, yAxis} = args;
    const scales = React.useMemo(() => {
        let xScale: ChartScale | undefined;
        let yScale: ChartScale | undefined;
        const hasAxisRelatedSeries = series.some(isAxisRelatedSeries);

        if (hasAxisRelatedSeries) {
            ({xScale, yScale} = createScales({boundsWidth, boundsHeight, series, xAxis, yAxis}));
        }

        return {xScale, yScale};
    }, [boundsWidth, boundsHeight, series, xAxis, yAxis]);

    return scales;
};
