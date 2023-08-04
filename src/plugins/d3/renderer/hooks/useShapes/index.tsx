import React from 'react';
import block from 'bem-cn-lite';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';

import type {ScatterSeriesData} from '../../../../../types/widget-data';

import {getOnlyVisibleSeries} from '../../utils';
import type {ChartOptions} from '../useChartOptions';
import type {ChartScale} from '../useScales';
import type {ChartSeries} from '../useSeries';

type Args = {
    series: ChartSeries[];
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
};

const b = block('chartkit-d3-scatter');
const DEFAULT_SCATTER_POINT_RADIUS = 4;

const prepareCategoricalScatterData = (data: ScatterSeriesData[]) => {
    return data.filter((d) => typeof d.category === 'string');
};

const prepareLinearScatterData = (data: ScatterSeriesData[]) => {
    return data.filter((d) => typeof d.x === 'number' && typeof d.y === 'number');
};

const getPointProperties = (args: {
    point: ScatterSeriesData;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
}) => {
    const {point, xAxis, xScale, yAxis, yScale} = args;
    const r = point.radius || DEFAULT_SCATTER_POINT_RADIUS;
    let cx: string | number | undefined;
    let cy: string | number | undefined;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        cx = xBandScale(point.category as string)! + xBandScale.step() / 2;
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cx = xLinearScale(point.x as number);
    }

    if (yAxis[0].type === 'category') {
        const yBandScale = yScale as ScaleBand<string>;
        cy = yBandScale(point.category as string)! + yBandScale.step() / 2;
    } else {
        const xLinearScale = yScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cy = xLinearScale(point.y as number);
    }

    return {r, cx, cy};
};

export const useShapes = (args: Args) => {
    const {series, xAxis, xScale, yAxis, yScale} = args;
    const shapes = React.useMemo(() => {
        const visibleSeries = getOnlyVisibleSeries(series);

        return visibleSeries.reduce<React.ReactElement[]>((acc, s) => {
            const randomKey = Math.random().toString();
            switch (s.type) {
                case 'scatter': {
                    const preparedData =
                        xAxis.type === 'category' || yAxis[0]?.type === 'category'
                            ? prepareCategoricalScatterData(s.data)
                            : prepareLinearScatterData(s.data);
                    acc.push(
                        ...preparedData.map((point, i) => {
                            const pointProps = getPointProperties({
                                point,
                                xAxis,
                                xScale,
                                yAxis,
                                yScale,
                            });

                            return (
                                <circle
                                    key={`${i}-${randomKey}`}
                                    className={b('point')}
                                    fill={s.color}
                                    {...pointProps}
                                />
                            );
                        }),
                    );
                    break;
                }
            }
            return acc;
        }, []);
    }, [series, xAxis, xScale, yAxis, yScale]);

    return {shapes};
};
