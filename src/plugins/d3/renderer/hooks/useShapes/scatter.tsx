import {pointer, ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import React from 'react';
import {ChartOptions} from '../useChartOptions/types';
import {ChartScale} from '../useScales';
import {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import block from 'bem-cn-lite';
import {ScatterSeries, ScatterSeriesData} from '../../../../../types/widget-data';

type PrepareScatterSeriesArgs = {
    series: ScatterSeries[];
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
    svgContainer: SVGSVGElement | null;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
    key?: string;
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
        cx = (xBandScale(point.category as string) || 0) + xBandScale.step() / 2;
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cx = xLinearScale(point.x as number);
    }

    if (yAxis[0].type === 'category') {
        const yBandScale = yScale as ScaleBand<string>;
        cy = (yBandScale(point.category as string) || 0) + yBandScale.step() / 2;
    } else {
        const yLinearScale = yScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cy = yLinearScale(point.y as number);
    }

    return {r, cx, cy};
};

export function prepareScatterSeries(args: PrepareScatterSeriesArgs) {
    const {
        series,
        xAxis,
        xScale,
        yAxis,
        yScale,
        onSeriesMouseMove,
        onSeriesMouseLeave,
        key,
        svgContainer,
    } = args;

    return series.reduce<React.ReactElement[]>((result, s) => {
        const preparedData =
            xAxis.type === 'category' || yAxis[0]?.type === 'category'
                ? prepareCategoricalScatterData(s.data)
                : prepareLinearScatterData(s.data);

        result.push(
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
                        key={`${i}-${key}`}
                        className={b('point')}
                        fill={s.color}
                        {...pointProps}
                        onMouseMove={function (e) {
                            onSeriesMouseMove?.({
                                hovered: {
                                    data: point,
                                    series: s,
                                },
                                pointerPosition: pointer(e, svgContainer),
                            });
                        }}
                        onMouseLeave={onSeriesMouseLeave}
                    />
                );
            }),
        );

        return result;
    }, []);
}