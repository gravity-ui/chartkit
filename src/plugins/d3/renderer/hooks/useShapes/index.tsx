import React from 'react';
import {group} from 'd3';

import type {BarXSeries, ScatterSeries} from '../../../../../types/widget-data';

import {getOnlyVisibleSeries} from '../../utils';
import type {ChartOptions} from '../useChartOptions/types';
import type {ChartScale} from '../useAxisScales';
import type {ChartSeries} from '../useSeries';
import type {OnSeriesMouseMove, OnSeriesMouseLeave} from '../useTooltip/types';
import {prepareBarXSeries} from './bar-x';
import {prepareScatterSeries} from './scatter';

type Args = {
    top: number;
    left: number;
    series: ChartSeries[];
    xAxis: ChartOptions['xAxis'];
    yAxis: ChartOptions['yAxis'];
    svgContainer: SVGSVGElement | null;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
    xScale?: ChartScale;
    yScale?: ChartScale;
};

export const useShapes = (args: Args) => {
    const {
        top,
        left,
        series,
        xAxis,
        xScale,
        yAxis,
        yScale,
        svgContainer,
        onSeriesMouseMove,
        onSeriesMouseLeave,
    } = args;

    const shapes = React.useMemo(() => {
        const visibleSeries = getOnlyVisibleSeries(series);
        const groupedSeries = group(visibleSeries, (item) => item.type);

        return Array.from(groupedSeries).reduce<React.ReactElement[]>((acc, item) => {
            const [seriesType, chartSeries] = item;
            switch (seriesType) {
                case 'bar-x': {
                    if (xScale && yScale) {
                        acc.push(
                            ...prepareBarXSeries({
                                top,
                                left,
                                series: chartSeries as BarXSeries[],
                                xAxis,
                                xScale,
                                yAxis,
                                yScale,
                                onSeriesMouseMove,
                                onSeriesMouseLeave,
                                svgContainer,
                            }),
                        );
                    }
                    break;
                }
                case 'scatter': {
                    if (xScale && yScale) {
                        acc.push(
                            ...prepareScatterSeries({
                                top,
                                left,
                                series: chartSeries as ScatterSeries[],
                                xAxis,
                                xScale,
                                yAxis,
                                yScale,
                                onSeriesMouseMove,
                                onSeriesMouseLeave,
                                svgContainer,
                            }),
                        );
                    }
                    break;
                }
            }
            return acc;
        }, []);
    }, [series, xAxis, xScale, yAxis, yScale, svgContainer, onSeriesMouseMove, onSeriesMouseLeave]);

    return {shapes};
};
