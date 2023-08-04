import React from 'react';
import {scaleBand, scaleLinear, scaleUtc, extent} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import type {ChartKitWidgetSeries} from '../../../../types/widget-data';

import type {ChartOptions} from './useChartOptions';
import {getOnlyVisibleSeries, getDomainDataXBySeries, getDomainDataYBySeries} from './utils';

export type ChartScale =
    | ScaleLinear<number, number>
    | ScaleBand<string>
    | ScaleTime<number, number>;

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    series: ChartKitWidgetSeries[];
    xAxis: ChartOptions['xAxis'];
    yAxis: ChartOptions['yAxis'];
};

type ReturnValue = {
    xScale: ChartScale;
    yScale: ChartScale;
};

const isNumericalArrayData = (data: unknown[]): data is number[] => {
    return data.every((d) => typeof d === 'number' || d === null);
};

const filterCategoriesByVisibleSeries = (categories: string[], series: ChartKitWidgetSeries[]) => {
    return categories.filter((category) => {
        return series.some((s) => {
            return s.data.some((d) => 'category' in d && d.category === category);
        });
    });
};

export const useScales = (args: Args): ReturnValue => {
    const {boundsWidth, boundsHeight, series, xAxis, yAxis} = args;
    const scales = React.useMemo(() => {
        const xType = get(xAxis, 'type', 'linear');
        const xCatigories = get(xAxis, 'categories');
        const xTimestamps = get(xAxis, 'timestamps');
        const yType = get(yAxis[0], 'type', 'linear');
        const yCatigories = get(yAxis[0], 'categories');
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

                if (isNumericalArrayData(domain)) {
                    const [xMin, xMax] = extent(domain) as [number, number];
                    xScale = scaleLinear().domain([xMin, xMax]).range([0, boundsWidth]).nice();
                }

                break;
            }
            case 'category': {
                if (xCatigories) {
                    const filteredCategories = filterCategoriesByVisibleSeries(
                        xCatigories,
                        visibleSeries,
                    );
                    xScale = scaleBand().domain(filteredCategories).range([0, boundsWidth]);
                }

                break;
            }
            case 'datetime': {
                if (xTimestamps) {
                    const [xMin, xMax] = extent(xTimestamps) as [number, number];
                    xScale = scaleUtc().domain([xMin, xMax]).range([0, boundsWidth]).nice();
                } else {
                    const domain = getDomainDataXBySeries(visibleSeries);

                    if (isNumericalArrayData(domain)) {
                        const [xMin, xMax] = extent(domain) as [number, number];
                        xScale = scaleUtc().domain([xMin, xMax]).range([0, boundsWidth]).nice();
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

                if (isNumericalArrayData(domain)) {
                    const [yMin, yMax] = extent(domain) as [number, number];
                    yScale = scaleLinear().domain([yMin, yMax]).range([boundsHeight, 0]).nice();
                }

                break;
            }
            case 'category': {
                if (yCatigories) {
                    const filteredCategories = filterCategoriesByVisibleSeries(
                        yCatigories,
                        visibleSeries,
                    );
                    yScale = scaleBand().domain(filteredCategories).range([boundsHeight, 0]);
                }

                break;
            }
            case 'datetime': {
                if (yTimestamps) {
                    const [yMin, yMax] = extent(yTimestamps) as [number, number];
                    yScale = scaleUtc().domain([yMin, yMax]).range([boundsHeight, 0]).nice();
                } else {
                    const domain = getDomainDataYBySeries(visibleSeries);

                    if (isNumericalArrayData(domain)) {
                        const [yMin, yMax] = extent(domain) as [number, number];
                        yScale = scaleUtc().domain([yMin, yMax]).range([boundsHeight, 0]).nice();
                    }
                }

                break;
            }
        }

        if (!yScale) {
            throw new Error('Failed to create yScale');
        }

        return {xScale, yScale};
    }, [boundsWidth, boundsHeight, series, xAxis, yAxis]);

    return scales;
};
