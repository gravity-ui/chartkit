import React from 'react';
import {group} from 'd3';

import type {BarXSeries, PieSeries, ScatterSeries} from '../../../../../types/widget-data';

import {getOnlyVisibleSeries} from '../../utils';
import type {ChartOptions} from '../useChartOptions/types';
import type {ChartScale} from '../useAxisScales';
import type {ChartSeries} from '../useSeries';
import type {OnSeriesMouseMove, OnSeriesMouseLeave} from '../useTooltip/types';
import {prepareBarXSeries} from './bar-x';
import {prepareScatterSeries} from './scatter';
import {PieSeriesComponent} from './pie';

import './styles.scss';

type Args = {
    boundsWidth: number;
    boundsHeight: number;
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
        boundsWidth,
        boundsHeight,
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
                                series: chartSeries as BarXSeries[],
                                xAxis,
                                xScale,
                                yAxis,
                                yScale,
                                onSeriesMouseMove,
                                onSeriesMouseLeave,
                            }),
                        );
                    }
                    break;
                }
                case 'scatter': {
                    if (xScale && yScale) {
                        acc.push(
                            ...prepareScatterSeries({
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
                case 'pie': {
                    acc.push(
                        ...(chartSeries as PieSeries[]).map((cs, i) => (
                            <PieSeriesComponent
                                key={`pie-${i}`}
                                boundsWidth={boundsWidth}
                                boundsHeight={boundsHeight}
                                series={cs}
                                onSeriesMouseMove={onSeriesMouseMove}
                                onSeriesMouseLeave={onSeriesMouseLeave}
                                svgContainer={svgContainer}
                            />
                        )),
                    );
                }
            }
            return acc;
        }, []);
    }, [
        boundsWidth,
        boundsHeight,
        series,
        xAxis,
        xScale,
        yAxis,
        yScale,
        svgContainer,
        onSeriesMouseMove,
        onSeriesMouseLeave,
    ]);

    return {shapes};
};
