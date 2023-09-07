import {max, pointer, select} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import React from 'react';
import get from 'lodash/get';

import type {BarXSeriesData, ChartKitWidgetSeriesOptions} from '../../../../../types';
import {block} from '../../../../../utils/cn';

import {getDataCategoryValue} from '../../utils';
import type {ChartScale} from '../useAxisScales';
import type {ChartOptions} from '../useChartOptions/types';
import type {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import type {PreparedBarXSeries} from '../useSeries/types';
import {DEFAULT_BAR_X_SERIES_OPTIONS} from './defaults';

const MIN_RECT_GAP = 1;
const MIN_GROUP_GAP = 1;
const DEFAULT_LABEL_PADDING = 7;

const b = block('d3-bar-x');

type Args = {
    top: number;
    left: number;
    series: PreparedBarXSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
    svgContainer: SVGSVGElement | null;
};

type ShapeData = {
    x: number;
    y: number;
    width: number;
    height: number;
    data: BarXSeriesData;
    series: PreparedBarXSeries;
};

function prepareData(args: {
    series: PreparedBarXSeries[];
    seriesOptions?: ChartKitWidgetSeriesOptions;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
}) {
    const {series, seriesOptions, xAxis, xScale, yScale} = args;
    const categories = get(xAxis, 'categories', [] as string[]);
    const {
        barMaxWidth: defaultBarMaxWidth,
        barPadding: defaultBarPadding,
        groupPadding: defaultGroupPadding,
    } = DEFAULT_BAR_X_SERIES_OPTIONS;
    const barMaxWidth = get(seriesOptions, 'bar-x.barMaxWidth', defaultBarMaxWidth);
    const barPadding = get(seriesOptions, 'bar-x.barPadding', defaultBarPadding);
    const groupPadding = get(seriesOptions, 'bar-x.groupPadding', defaultGroupPadding);

    const data: Record<
        string | number,
        Record<string, {data: BarXSeriesData; series: PreparedBarXSeries}[]>
    > = {};
    series.forEach((s) => {
        s.data.forEach((d) => {
            const xValue =
                xAxis.type === 'category'
                    ? getDataCategoryValue({axisDirection: 'x', categories, data: d})
                    : d.x;

            if (xValue) {
                if (!data[xValue]) {
                    data[xValue] = {};
                }

                const xGroup = data[xValue];

                if (!xGroup[s.stackId]) {
                    xGroup[s.stackId] = [];
                }

                xGroup[s.stackId].push({data: d, series: s});
            }
        });
    });

    let bandWidth = Infinity;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        bandWidth = xBandScale.bandwidth();
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        const xValues = series.reduce<number[]>((acc, s) => {
            s.data.forEach((dataItem) => acc.push(Number(dataItem.x)));
            return acc;
        }, []);

        xValues.sort().forEach((xValue, index) => {
            if (index > 0 && xValue !== xValues[index - 1]) {
                const dist = xLinearScale(xValue) - xLinearScale(xValues[index - 1]);
                if (dist < bandWidth) {
                    bandWidth = dist;
                }
            }
        });
    }

    const maxGroupSize = max(Object.values(data), (d) => Object.values(d).length) || 1;
    const groupGap = Math.max(bandWidth * groupPadding, MIN_GROUP_GAP);
    const groupWidth = bandWidth - groupGap;
    const rectGap = Math.max(bandWidth * barPadding, MIN_RECT_GAP);
    const rectWidth = Math.min(groupWidth / maxGroupSize - rectGap, barMaxWidth);

    const result: ShapeData[] = [];

    Object.entries(data).forEach(([xValue, val]) => {
        const stacks = Object.values(val);
        const currentGroupWidth = rectWidth * stacks.length + rectGap * (stacks.length - 1);
        stacks.forEach((yValues, groupItemIndex) => {
            let stackHeight = 0;
            yValues.forEach((yValue) => {
                let xCenter;
                if (xAxis.type === 'category') {
                    const xBandScale = xScale as ScaleBand<string>;
                    xCenter = (xBandScale(xValue as string) || 0) + xBandScale.bandwidth() / 2;
                } else {
                    const xLinearScale = xScale as
                        | ScaleLinear<number, number>
                        | ScaleTime<number, number>;
                    xCenter = xLinearScale(Number(xValue));
                }
                const x = xCenter - currentGroupWidth / 2 + (rectWidth + rectGap) * groupItemIndex;

                const yLinearScale = yScale as ScaleLinear<number, number>;
                const y = yLinearScale(yValue.data.y as number);
                const height = yLinearScale(yLinearScale.domain()[0]) - y;

                result.push({
                    x,
                    y: y - stackHeight,
                    width: rectWidth,
                    height,
                    data: yValue.data,
                    series: yValue.series,
                });

                stackHeight += height + 1;
            });
        });
    });

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

        const shapes = prepareData({
            series,
            xAxis,
            xScale,
            yAxis,
            yScale,
        });

        svgElement
            .selectAll('allRects')
            .data(shapes)
            .join('rect')
            .attr('class', b('segment'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('height', (d) => d.height)
            .attr('width', (d) => d.width)
            .attr('fill', (d) => d.data.color || d.series.color)
            .on('mousemove', (e, d) => {
                const [x, y] = pointer(e, svgContainer);
                onSeriesMouseMove?.({
                    hovered: {
                        data: d.data,
                        series: d.series,
                    },
                    pointerPosition: [x - left, y - top],
                });
            })
            .on('mouseleave', () => {
                if (onSeriesMouseLeave) {
                    onSeriesMouseLeave();
                }
            });

        const dataLabels = shapes.filter((s) => s.series.dataLabels.enabled);

        svgElement
            .selectAll('allLabels')
            .data(dataLabels)
            .join('text')
            .text((d) => String(d.data.label || d.data.y))
            .attr('class', b('label'))
            .attr('x', (d) => d.x + d.width / 2)
            .attr('y', (d) => {
                if (d.series.dataLabels.inside) {
                    return d.y + d.height / 2;
                }

                return d.y - DEFAULT_LABEL_PADDING;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', (d) => d.series.dataLabels.style.fontSize)
            .style('font-weight', (d) => d.series.dataLabels.style.fontWeight || null)
            .style('fill', (d) => d.series.dataLabels.style.fontColor || null);
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
