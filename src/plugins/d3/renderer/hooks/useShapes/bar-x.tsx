import React from 'react';
import {ChartOptions} from '../useChartOptions/types';
import {ChartScale} from '../useAxisScales';
import {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import {BarXSeries, BarXSeriesData} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';
import {pointer, ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import {getRandomCKId} from '../../../../../utils';

const DEFAULT_BAR_RECT_WIDTH = 50;
const DEFAULT_LINEAR_BAR_RECT_WIDTH = 20;
const MIN_RECT_GAP = 1;

const b = block('d3-bar');

type Args = {
    top: number;
    left: number;
    series: BarXSeries[];
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
    svgContainer: SVGSVGElement | null;
};

const getRectProperties = (args: {
    point: BarXSeriesData;
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
        const maxWidth = xBandScale.bandwidth() - MIN_RECT_GAP;
        width = Math.min(maxWidth, DEFAULT_BAR_RECT_WIDTH);
        cx = (xBandScale(point.category as string) || 0) + xBandScale.step() / 2 - width / 2;
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        const [min, max] = xLinearScale.domain();
        const range = xLinearScale.range();
        const maxWidth =
            ((range[1] - range[0]) * minPointDistance) / (Number(max) - Number(min)) - MIN_RECT_GAP;

        width = Math.min(Math.max(maxWidth, 1), DEFAULT_LINEAR_BAR_RECT_WIDTH);
        cx = xLinearScale(point.x as number) - width / 2;
    }

    if (yAxis[0].type === 'linear') {
        const yLinearScale = yScale as ScaleLinear<number, number>;
        cy = yLinearScale(point.y as number);
        height = yLinearScale(yLinearScale.domain()[0]) - cy;
    } else {
        throw Error(`The "${yAxis[0].type}" type for the Y axis is not supported`);
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

export function prepareBarXSeries(args: Args) {
    const {
        top,
        left,
        series,
        xAxis,
        xScale,
        yAxis,
        yScale,
        onSeriesMouseMove,
        onSeriesMouseLeave,
        svgContainer,
    } = args;
    const seriesData = series.map(({data}) => data).flat(2);
    const minPointDistance = minDiff(seriesData.map((item) => Number(item.x)));

    return series.reduce<React.ReactElement[]>((result, item) => {
        const randomKey = getRandomCKId();

        item.data.forEach((point, i) => {
            const rectProps = getRectProperties({
                point,
                xAxis,
                xScale,
                yAxis,
                yScale,
                minPointDistance,
            });

            result.push(
                <rect
                    key={`${i}-${randomKey}`}
                    className={b('rect')}
                    fill={item.color}
                    {...rectProps}
                    onMouseMove={function (e) {
                        const [x, y] = pointer(e, svgContainer);
                        onSeriesMouseMove?.({
                            hovered: {
                                data: point,
                                series: item,
                            },
                            pointerPosition: [x - left, y - top],
                        });
                    }}
                    onMouseLeave={onSeriesMouseLeave}
                />,
            );
        });

        return result;
    }, []);
}
