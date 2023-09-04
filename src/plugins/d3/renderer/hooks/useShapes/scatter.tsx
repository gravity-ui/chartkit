import {pointer, select} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import React from 'react';
import {ChartOptions} from '../useChartOptions/types';
import {ChartScale} from '../useAxisScales';
import {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import {ScatterSeries, ScatterSeriesData} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

type ScatterSeriesShapeProps = {
    top: number;
    left: number;
    series: ScatterSeries;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
    svgContainer: SVGSVGElement | null;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
};

const b = block('d3-scatter');
const DEFAULT_SCATTER_POINT_RADIUS = 4;

const prepareCategoricalScatterData = (data: ScatterSeriesData[]) => {
    return data.filter((d) => typeof d.category === 'string');
};

const prepareLinearScatterData = (data: ScatterSeriesData[]) => {
    return data.filter((d) => typeof d.x === 'number' && typeof d.y === 'number');
};

const getCxAttr = (args: {
    point: ScatterSeriesData;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
}) => {
    const {point, xAxis, xScale} = args;

    let cx: number;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        cx = (xBandScale(point.category as string) || 0) + xBandScale.step() / 2;
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cx = xLinearScale(point.x as number);
    }

    return cx;
};

const getCyAttr = (args: {
    point: ScatterSeriesData;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
}) => {
    const {point, yAxis, yScale} = args;

    let cy: number;

    if (yAxis[0].type === 'category') {
        const yBandScale = yScale as ScaleBand<string>;
        cy = (yBandScale(point.category as string) || 0) + yBandScale.step() / 2;
    } else {
        const yLinearScale = yScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cy = yLinearScale(point.y as number);
    }

    return cy;
};

export function ScatterSeriesShape(props: ScatterSeriesShapeProps) {
    const {
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
    } = props;
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const preparedData =
            xAxis.type === 'category' || yAxis[0]?.type === 'category'
                ? prepareCategoricalScatterData(series.data)
                : prepareLinearScatterData(series.data);

        svgElement
            .selectAll('allPoints')
            .data(preparedData)
            .enter()
            .append('circle')
            .attr('class', b('point'))
            .attr('fill', (d) => d.color || series.color || '')
            .attr('r', (d) => d.radius || DEFAULT_SCATTER_POINT_RADIUS)
            .attr('cx', (d) => getCxAttr({point: d, xAxis, xScale}))
            .attr('cy', (d) => getCyAttr({point: d, yAxis, yScale}))
            .on('mousemove', (e, d) => {
                const [x, y] = pointer(e, svgContainer);
                onSeriesMouseMove?.({
                    hovered: {
                        data: d,
                        series,
                    },
                    pointerPosition: [x - left, y - top],
                });
            })
            .on('mouseleave', () => {
                if (onSeriesMouseLeave) {
                    onSeriesMouseLeave();
                }
            });
    }, [
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

    return <g ref={ref} className={b()} />;
}
