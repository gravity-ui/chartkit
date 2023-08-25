import React from 'react';
import {scaleBand, scaleLinear, scaleUtc, extent} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import type {ChartOptions} from '../useChartOptions/types';
import {
    getOnlyVisibleSeries,
    getDomainDataYBySeries,
    isAxisRelatedSeries,
    getDomainDataXBySeries,
    isSeriesWithCategoryValues,
} from '../../utils';
import {PreparedSeries} from '../useSeries/types';

export type ChartScale =
    | ScaleLinear<number, number>
    | ScaleBand<string>
    | ScaleTime<number, number>;

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    series: PreparedSeries[];
    xAxis: ChartOptions['xAxis'];
    yAxis: ChartOptions['yAxis'];
};

type ReturnValue = {
    xScale?: ChartScale;
    yScale?: ChartScale;
};

const isNumericalArrayData = (data: unknown[]): data is number[] => {
    return data.every((d) => typeof d === 'number' || d === null);
};

const filterCategoriesByVisibleSeries = (categories: string[], series: PreparedSeries[]) => {
    return categories.filter((category) => {
        return series.some((s) => {
            return isSeriesWithCategoryValues(s) && s.data.some((d) => d.category === category);
        });
    });
};

const createScales = (args: Args) => {
    const {boundsWidth, boundsHeight, series, xAxis, yAxis} = args;
    const xMin = get(xAxis, 'min');
    const xType = get(xAxis, 'type', 'linear');
    const xCategories = get(xAxis, 'categories');
    const xTimestamps = get(xAxis, 'timestamps');
    const yType = get(yAxis[0], 'type', 'linear');
    const yMin = get(yAxis[0], 'min');
    const yCategories = get(yAxis[0], 'categories');
    const yTimestamps = get(xAxis, 'timestamps');
    let visibleSeries = getOnlyVisibleSeries(series);
    // Reassign to all series in case of all series unselected,
    // otherwise we will get an empty space without grid
    visibleSeries = visibleSeries.length === 0 ? series : visibleSeries;
    let xScale: ChartScale | undefined;
    let yScale: ChartScale | undefined;

    switch (xType) {
        case 'linear': {
            const domain = getDomainDataXBySeries(visibleSeries);
            const range = [0, boundsWidth - boundsWidth * xAxis.maxPadding];

            if (isNumericalArrayData(domain)) {
                const [domainXMin, xMax] = extent(domain) as [number, number];
                const xMinValue = typeof xMin === 'number' ? xMin : domainXMin;
                xScale = scaleLinear().domain([xMinValue, xMax]).range(range).nice();
            }

            break;
        }
        case 'category': {
            if (xCategories) {
                const filteredCategories = filterCategoriesByVisibleSeries(
                    xCategories,
                    visibleSeries,
                );
                xScale = scaleBand().domain(filteredCategories).range([0, boundsWidth]);
            }

            break;
        }
        case 'datetime': {
            const range = [0, boundsWidth - boundsWidth * xAxis.maxPadding];

            if (xTimestamps) {
                const [xMin, xMax] = extent(xTimestamps) as [number, number];
                xScale = scaleUtc().domain([xMin, xMax]).range(range).nice();
            } else {
                const domain = getDomainDataXBySeries(visibleSeries);

                if (isNumericalArrayData(domain)) {
                    const [xMin, xMax] = extent(domain) as [number, number];
                    xScale = scaleUtc().domain([xMin, xMax]).range(range).nice();
                }
            }

            break;
        }
    }

    if (!xScale) {
        throw new Error('Failed to create xScale');
    }

    switch (yType) {
        case 'linear': {
            const domain = getDomainDataYBySeries(visibleSeries);
            const range = [boundsHeight, boundsHeight * yAxis[0].maxPadding];

            if (isNumericalArrayData(domain)) {
                const [domainYMin, yMax] = extent(domain) as [number, number];
                const yMinValue = typeof yMin === 'number' ? yMin : domainYMin;
                yScale = scaleLinear().domain([yMinValue, yMax]).range(range).nice();
            }

            break;
        }
        case 'category': {
            if (yCategories) {
                const filteredCategories = filterCategoriesByVisibleSeries(
                    yCategories,
                    visibleSeries,
                );
                yScale = scaleBand().domain(filteredCategories).range([boundsHeight, 0]);
            }

            break;
        }
        case 'datetime': {
            const range = [boundsHeight, boundsHeight * yAxis[0].maxPadding];

            if (yTimestamps) {
                const [yMin, yMax] = extent(yTimestamps) as [number, number];
                yScale = scaleUtc().domain([yMin, yMax]).range(range).nice();
            } else {
                const domain = getDomainDataYBySeries(visibleSeries);

                if (isNumericalArrayData(domain)) {
                    const [yMin, yMax] = extent(domain) as [number, number];
                    yScale = scaleUtc().domain([yMin, yMax]).range(range).nice();
                }
            }

            break;
        }
    }

    if (!yScale) {
        throw new Error('Failed to create yScale');
    }

    return {xScale, yScale};
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