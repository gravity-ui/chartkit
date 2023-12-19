import React from 'react';
import {Dispatch, group} from 'd3';

import {getOnlyVisibleSeries} from '../../utils';
import type {PreparedAxis} from '../useChartOptions/types';
import type {ChartScale} from '../useAxisScales';
import type {
    PreparedAreaSeries,
    PreparedBarXSeries,
    PreparedBarYSeries,
    PreparedLineSeries,
    PreparedPieSeries,
    PreparedScatterSeries,
    PreparedSeries,
    PreparedSeriesOptions,
} from '../';
import {BarXSeriesShapes, prepareBarXData} from './bar-x';
import type {PreparedBarXData} from './bar-x';
import {ScatterSeriesShape, prepareScatterData} from './scatter';
import type {PreparedScatterData} from './scatter';
import {PieSeriesShapes} from './pie';
import {preparePieData} from './pie/prepare-data';
import type {PreparedPieData} from './pie/types';
import {prepareLineData} from './line/prepare-data';
import {LineSeriesShapes} from './line';
import type {PreparedLineData} from './line/types';
import {BarYSeriesShapes, prepareBarYData} from './bar-y';
import type {PreparedBarYData} from './bar-y/types';
export type {PreparedBarXData} from './bar-x';
export type {PreparedScatterData} from './scatter';
import {AreaSeriesShapes} from './area';
import {prepareAreaData} from './area/prepare-data';
import type {PreparedAreaData} from './area/types';

import './styles.scss';

export type ShapeData =
    | PreparedBarXData
    | PreparedBarYData
    | PreparedScatterData
    | PreparedLineData
    | PreparedPieData
    | PreparedAreaData;

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    dispatcher: Dispatch<object>;
    series: PreparedSeries[];
    seriesOptions: PreparedSeriesOptions;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis[];
    svgContainer: SVGSVGElement | null;
    xScale?: ChartScale;
    yScale?: ChartScale;
};

export const useShapes = (args: Args) => {
    const {
        boundsWidth,
        boundsHeight,
        dispatcher,
        series,
        seriesOptions,
        xAxis,
        xScale,
        yAxis,
        yScale,
        svgContainer,
    } = args;

    const shapesComponents = React.useMemo(() => {
        const visibleSeries = getOnlyVisibleSeries(series);
        const groupedSeries = group(visibleSeries, (item) => item.type);
        const shapesData: ShapeData[] = [];
        const shapes = Array.from(groupedSeries).reduce<React.ReactElement[]>((acc, item) => {
            const [seriesType, chartSeries] = item;
            switch (seriesType) {
                case 'bar-x': {
                    if (xScale && yScale) {
                        const preparedData = prepareBarXData({
                            series: chartSeries as PreparedBarXSeries[],
                            seriesOptions,
                            xAxis,
                            xScale,
                            yAxis,
                            yScale,
                        });
                        acc.push(
                            <BarXSeriesShapes
                                key="bar-x"
                                dispatcher={dispatcher}
                                seriesOptions={seriesOptions}
                                preparedData={preparedData}
                            />,
                        );
                        shapesData.push(...preparedData);
                    }
                    break;
                }
                case 'bar-y': {
                    if (xScale && yScale) {
                        const preparedData = prepareBarYData({
                            series: chartSeries as PreparedBarYSeries[],
                            seriesOptions,
                            xAxis,
                            xScale,
                            yAxis,
                            yScale,
                        });
                        acc.push(
                            <BarYSeriesShapes
                                key="bar-y"
                                dispatcher={dispatcher}
                                seriesOptions={seriesOptions}
                                preparedData={preparedData}
                            />,
                        );
                        shapesData.push(...preparedData);
                    }
                    break;
                }
                case 'line': {
                    if (xScale && yScale) {
                        const preparedData = prepareLineData({
                            series: chartSeries as PreparedLineSeries[],
                            xAxis,
                            xScale,
                            yAxis,
                            yScale,
                        });
                        acc.push(
                            <LineSeriesShapes
                                key="line"
                                dispatcher={dispatcher}
                                seriesOptions={seriesOptions}
                                preparedData={preparedData}
                            />,
                        );
                        shapesData.push(...preparedData);
                    }
                    break;
                }
                case 'area': {
                    if (xScale && yScale) {
                        const preparedData = prepareAreaData({
                            series: chartSeries as PreparedAreaSeries[],
                            xAxis,
                            xScale,
                            yAxis,
                            yScale,
                        });
                        acc.push(
                            <AreaSeriesShapes
                                key="area"
                                dispatcher={dispatcher}
                                seriesOptions={seriesOptions}
                                preparedData={preparedData}
                            />,
                        );
                        shapesData.push(...preparedData);
                    }
                    break;
                }
                case 'scatter': {
                    if (xScale && yScale) {
                        const preparedData = prepareScatterData({
                            series: chartSeries as PreparedScatterSeries[],
                            xAxis,
                            xScale,
                            yAxis: yAxis[0],
                            yScale,
                        });
                        acc.push(
                            <ScatterSeriesShape
                                key="scatter"
                                dispatcher={dispatcher}
                                preparedData={preparedData}
                                seriesOptions={seriesOptions}
                                svgContainer={svgContainer}
                            />,
                        );
                    }
                    break;
                }
                case 'pie': {
                    const preparedData = preparePieData({
                        series: chartSeries as PreparedPieSeries[],
                        boundsWidth,
                        boundsHeight,
                    });

                    acc.push(
                        <PieSeriesShapes
                            key="pie"
                            dispatcher={dispatcher}
                            preparedData={preparedData}
                            seriesOptions={seriesOptions}
                            svgContainer={svgContainer}
                        />,
                    );
                }
            }
            return acc;
        }, []);

        return {shapes, shapesData};
    }, [
        boundsWidth,
        boundsHeight,
        dispatcher,
        series,
        seriesOptions,
        xAxis,
        xScale,
        yAxis,
        yScale,
        svgContainer,
    ]);

    return {shapes: shapesComponents.shapes, shapesData: shapesComponents.shapesData};
};
