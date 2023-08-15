import React from 'react';
import {ChartOptions} from '../useChartOptions/types';
import {ChartScale} from '../useScales';
import {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import {BarSeries, BarSeriesData} from '../../../../../types/widget-data';
import {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import block from 'bem-cn-lite';

const DEFAULT_BAR_RECT_WIDTH = 50;

const b = block('chartkit-d3-bar');

type Args = {
    series: BarSeries;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
    key?: string;
};

const getRectProperties = (args: {
    point: BarSeriesData;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
    minPointDistance: number;
}) => {
    const {point, xAxis, xScale, yAxis, yScale, minPointDistance} = args;
    let cx: string | number | undefined;
    let cy: string | number | undefined;
    let width: number;
    let height: number;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        width = Math.min(xBandScale.bandwidth(), DEFAULT_BAR_RECT_WIDTH);
        cx = (xBandScale(point.category as string) || 0) + xBandScale.step() / 2 - width / 2;
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        const [min, max] = xLinearScale.domain();
        const range = xLinearScale.range();
        const maxWidth =
            ((range[1] - range[0]) * minPointDistance) / (Number(max) - Number(min)) - 1;

        width = Math.min(Math.max(maxWidth, 1), DEFAULT_BAR_RECT_WIDTH);
        cx = xLinearScale(point.x as number) - width / 2;
    }

    if (yAxis[0].type === 'category') {
        const yBandScale = yScale as ScaleBand<string>;
        cy = (yBandScale(point.category as string) || 0) + yBandScale.step() / 2;
        height = (yBandScale(yBandScale.domain()[0]) || 0) + yBandScale.step() - cy;
    } else {
        const yLinearScale = yScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cy = yLinearScale(point.y as number);
        height = yLinearScale(yLinearScale.domain()[0]) - cy;
    }

    return {x: cx, y: cy, width, height};
};

function minDiff(arr: number[]) {
    let result = Infinity;

    for (let i = 0; i < arr.length - 1; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            const diff = Math.abs(arr[i] - arr[j]);
            if (diff < result) {
                result = diff;
            }
        }
    }

    return result;
}

export function prepareBarSeries(args: Args) {
    const {series, xAxis, xScale, yAxis, yScale, onSeriesMouseMove, onSeriesMouseLeave, key} = args;
    const preparedData = series.data;
    const minPointDistance = minDiff(preparedData.map((item) => Number(item.x)));

    return preparedData.map((point, i) => {
        const rectProps = getRectProperties({
            point,
            xAxis,
            xScale,
            yAxis,
            yScale,
            minPointDistance,
        });

        return (
            <rect
                key={`${i}-${key}`}
                className={b('rect')}
                fill={series.color}
                {...rectProps}
                onMouseMove={function () {
                    onSeriesMouseMove?.({
                        hovered: {
                            data: point,
                            series,
                        },
                    });
                }}
                onMouseLeave={onSeriesMouseLeave}
            />
        );
    });
}
