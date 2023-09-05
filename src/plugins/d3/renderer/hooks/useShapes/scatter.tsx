import React from 'react';
import {pointer, select} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import type {ScatterSeries, ScatterSeriesData} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import {getDataCategoryValue} from '../../utils';
import type {ChartScale} from '../useAxisScales';
import type {ChartOptions, PreparedAxis} from '../useChartOptions/types';
import type {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';

type ScatterSeriesShapeProps = {
    top: number;
    left: number;
    series: ScatterSeries;
    xAxis: PreparedAxis;
    xScale: ChartScale;
    yAxis: PreparedAxis[];
    yScale: ChartScale;
    svgContainer: SVGSVGElement | null;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
};

const b = block('d3-scatter');
const DEFAULT_SCATTER_POINT_RADIUS = 4;

const prepareCategoricalScatterData = (args: {
    data: ScatterSeriesData[];
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
}) => {
    const {data, xAxis, yAxis} = args;
    const isXCategorical = xAxis.type === 'category';
    const isYCategorical = yAxis.type === 'category';
    const xCategories = get(xAxis, 'categories', [] as string[]);
    const yCategories = get(yAxis, 'categories', [] as string[]);

    return data.filter((d) => {
        const xCategory =
            isXCategorical &&
            getDataCategoryValue({
                axisType: 'x',
                categories: xCategories,
                data: d,
            });
        const yCategory =
            isYCategorical &&
            getDataCategoryValue({
                axisType: 'y',
                categories: yCategories,
                data: d,
            });

        if (isXCategorical && isYCategorical) {
            return typeof xCategory === 'string' && typeof yCategory === 'string';
        }

        if (isYCategorical) {
            return typeof yCategory === 'string';
        }

        return typeof xCategory === 'string';
    });
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
        const categories = get(xAxis, 'categories', [] as string[]);
        const dataCategory = getDataCategoryValue({axisType: 'x', categories, data: point});
        cx = (xBandScale(dataCategory) || 0) + xBandScale.step() / 2;
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
        const categories = get(yAxis, 'categories', [] as string[]);
        const dataCategory = getDataCategoryValue({axisType: 'y', categories, data: point});
        cy = (yBandScale(dataCategory) || 0) + yBandScale.step() / 2;
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
                ? prepareCategoricalScatterData({data: series.data, xAxis, yAxis: yAxis[0]})
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
