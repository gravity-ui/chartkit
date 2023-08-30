import React from 'react';
import {ChartOptions} from '../useChartOptions/types';
import {ChartScale} from '../useAxisScales';
import {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import {BarXSeriesData} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';
import {group, pointer, ScaleBand, ScaleLinear, ScaleTime, select} from 'd3';
import {PreparedBarXSeries} from '../useSeries/types';

const DEFAULT_BAR_RECT_WIDTH = 50;
const DEFAULT_LINEAR_BAR_RECT_WIDTH = 20;
const MIN_RECT_GAP = 1;
const DEFAULT_LABEL_PADDING = 7;

const b = block('d3-bar-x');

type Args = {
    top: number;
    left: number;
    series: PreparedBarXSeries[];
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

export function BarXSeriesShapes(args: Args) {
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

    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();

        const xValues =
            xAxis.type === 'category'
                ? []
                : series.reduce<number[]>((acc, {data}) => {
                      data.forEach((dataItem) => acc.push(Number(dataItem.x)));
                      return acc;
                  }, []);
        const minPointDistance = minDiff(xValues);

        const stackedSeriesMap = group(series, (item) => item.stackId);
        Array.from(stackedSeriesMap).forEach(([, stackedSeries]) => {
            const stackHeights: Record<string, number> = {};
            stackedSeries.forEach((item) => {
                const shapes = item.data.map((dataItem) => {
                    const rectProps = getRectProperties({
                        point: dataItem,
                        xAxis,
                        xScale,
                        yAxis,
                        yScale,
                        minPointDistance,
                    });

                    if (!stackHeights[rectProps.x]) {
                        stackHeights[rectProps.x] = 0;
                    }

                    const rectY = rectProps.y - stackHeights[rectProps.x];
                    stackHeights[rectProps.x] += rectProps.height + 1;

                    return {
                        ...rectProps,
                        y: rectY,
                        data: dataItem,
                    };
                });

                svgElement
                    .append('g')
                    .attr('fill', item.color)
                    .selectAll('rect')
                    .data(shapes)
                    .join('rect')
                    .attr('class', b('segment'))
                    .attr('x', (d) => d.x)
                    .attr('y', (d) => d.y)
                    .attr('height', (d) => d.height)
                    .attr('width', (d) => d.width)
                    .on('mousemove', (e, point) => {
                        const [x, y] = pointer(e, svgContainer);
                        onSeriesMouseMove?.({
                            hovered: {
                                data: point.data,
                                series: item,
                            },
                            pointerPosition: [x - left, y - top],
                        });
                    })
                    .on('mouseleave', () => {
                        if (onSeriesMouseLeave) {
                            onSeriesMouseLeave();
                        }
                    });

                if (item.dataLabels.enabled) {
                    svgElement
                        .append('g')
                        .style('font-size', item.dataLabels.style.fontSize)
                        .style('font-weight', item.dataLabels.style.fontWeight)
                        .selectAll('text')
                        .data(shapes)
                        .join('text')
                        .text((d) => String(d.data.label || d.data.y))
                        .attr('class', b('label'))
                        .attr('x', (d) => d.x + d.width / 2)
                        .attr('y', (d) => {
                            if (item.dataLabels.inside) {
                                return d.y + d.height / 2;
                            }

                            return d.y - DEFAULT_LABEL_PADDING;
                        })
                        .style('fill', item.dataLabels.style.fontColor)
                        .attr('text-anchor', 'middle');
                }
            });
        });
    }, [
        onSeriesMouseMove,
        onSeriesMouseLeave,
        svgContainer,
        xAxis,
        xScale,
        yAxis,
        yScale,
        series,
        left,
        top,
    ]);

    return <g ref={ref} className={b()} />;
}
