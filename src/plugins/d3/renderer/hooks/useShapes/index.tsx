import React from 'react';
import {group} from 'd3';

import type {ChartKitWidgetSeriesOptions, ScatterSeries} from '../../../../../types';
import {getRandomCKId} from '../../../../../utils';

import {getOnlyVisibleSeries} from '../../utils';
import type {ChartOptions} from '../useChartOptions/types';
import type {ChartScale} from '../useAxisScales';
import type {PreparedBarXSeries, PreparedPieSeries, PreparedSeries} from '../';
import type {OnSeriesMouseMove, OnSeriesMouseLeave} from '../useTooltip/types';
import {BarXSeriesShapes} from './bar-x';
import {ScatterSeriesShape} from './scatter';
import {PieSeriesComponent} from './pie';

import './styles.scss';

type Args = {
    top: number;
    left: number;
    boundsWidth: number;
    boundsHeight: number;
    series: PreparedSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
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
        boundsWidth,
        boundsHeight,
        series,
        seriesOptions,
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
                            <BarXSeriesShapes
                                key="bar-x"
                                series={chartSeries as PreparedBarXSeries[]}
                                seriesOptions={seriesOptions}
                                xAxis={xAxis}
                                xScale={xScale}
                                yAxis={yAxis}
                                yScale={yScale}
                                top={top}
                                left={left}
                                svgContainer={svgContainer}
                                onSeriesMouseMove={onSeriesMouseMove}
                                onSeriesMouseLeave={onSeriesMouseLeave}
                            />,
                        );
                    }
                    break;
                }
                case 'scatter': {
                    if (xScale && yScale) {
                        const scatterShapes = chartSeries.map((scatterSeries, i) => {
                            const id = getRandomCKId();
                            return (
                                <ScatterSeriesShape
                                    key={`${i}-${id}`}
                                    top={top}
                                    left={left}
                                    series={scatterSeries as ScatterSeries}
                                    xAxis={xAxis}
                                    xScale={xScale}
                                    yAxis={yAxis}
                                    yScale={yScale}
                                    onSeriesMouseMove={onSeriesMouseMove}
                                    onSeriesMouseLeave={onSeriesMouseLeave}
                                    svgContainer={svgContainer}
                                />
                            );
                        });
                        acc.push(...scatterShapes);
                    }
                    break;
                }
                case 'pie': {
                    const groupedPieSeries = group(
                        chartSeries as PreparedPieSeries[],
                        (pieSeries) => pieSeries.stackId,
                    );
                    acc.push(
                        ...Array.from(groupedPieSeries).map(([key, pieSeries]) => {
                            return (
                                <PieSeriesComponent
                                    key={`pie-${key}`}
                                    boundsWidth={boundsWidth}
                                    boundsHeight={boundsHeight}
                                    series={pieSeries}
                                    onSeriesMouseMove={onSeriesMouseMove}
                                    onSeriesMouseLeave={onSeriesMouseLeave}
                                    svgContainer={svgContainer}
                                />
                            );
                        }),
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
        left,
        top,
        onSeriesMouseMove,
        onSeriesMouseLeave,
    ]);

    return {shapes};
};
