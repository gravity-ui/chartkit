import {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import {PreparedAxis} from '../useChartOptions/types';
import {ChartScale} from '../useAxisScales';
import {getDataCategoryValue} from '../../utils';

export function getXValue(args: {
    point: {x?: number | string};
    xAxis: PreparedAxis;
    xScale: ChartScale;
}) {
    const {point, xAxis, xScale} = args;

    let cx: number;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        const categories = get(xAxis, 'categories', [] as string[]);
        const dataCategory = getDataCategoryValue({axisDirection: 'x', categories, data: point});
        cx = (xBandScale(dataCategory) || 0) + xBandScale.step() / 2;
    } else {
        const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cx = xLinearScale(point.x as number);
    }

    return cx;
}

export function getYValue(args: {
    point: {y?: number | string};
    yAxis: PreparedAxis;
    yScale: ChartScale;
}) {
    const {point, yAxis, yScale} = args;

    let cy: number;

    if (yAxis.type === 'category') {
        const yBandScale = yScale as ScaleBand<string>;
        const categories = get(yAxis, 'categories', [] as string[]);
        const dataCategory = getDataCategoryValue({axisDirection: 'y', categories, data: point});
        cy = (yBandScale(dataCategory) || 0) + yBandScale.step() / 2;
    } else {
        const yLinearScale = yScale as ScaleLinear<number, number> | ScaleTime<number, number>;
        cy = yLinearScale(point.y as number);
    }

    return cy;
}
