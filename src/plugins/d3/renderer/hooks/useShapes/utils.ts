import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import {PreparedAxis} from '../useChartOptions/types';
import {ChartScale} from '../useAxisScales';
import {getDataCategoryValue} from '../../utils';
import {PreparedLineData} from './line/types';
import {PreparedScatterData} from './scatter';

export function getXValue(args: {
    point: {x?: number | string};
    xAxis: PreparedAxis;
    xScale: ChartScale;
}) {
    const {point, xAxis, xScale} = args;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        const categories = get(xAxis, 'categories', [] as string[]);
        const dataCategory = getDataCategoryValue({axisDirection: 'x', categories, data: point});
        return (xBandScale(dataCategory) || 0) + xBandScale.step() / 2;
    }

    const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
    return xLinearScale(point.x as number);
}

export function getYValue(args: {
    point: {y?: number | string};
    yAxis: PreparedAxis;
    yScale: ChartScale;
}) {
    const {point, yAxis, yScale} = args;

    if (yAxis.type === 'category') {
        const yBandScale = yScale as ScaleBand<string>;
        const categories = get(yAxis, 'categories', [] as string[]);
        const dataCategory = getDataCategoryValue({axisDirection: 'y', categories, data: point});
        return (yBandScale(dataCategory) || 0) + yBandScale.step() / 2;
    }

    const yLinearScale = yScale as ScaleLinear<number, number> | ScaleTime<number, number>;
    return yLinearScale(point.y as number);
}

export const shapeKey = (d: unknown) => (d as PreparedLineData | PreparedScatterData).id || -1;
