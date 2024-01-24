import type {BaseType, ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import {select} from 'd3';
import get from 'lodash/get';

import type {BasicInactiveState} from '../../../../../types';
import {getDataCategoryValue} from '../../utils';
import type {ChartScale} from '../useAxisScales';
import type {PreparedAxis} from '../useChartOptions/types';

import type {PreparedLineData} from './line/types';
import {DashStyle} from '../../../../../constants';

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

export const shapeKey = (d: unknown) => (d as PreparedLineData).id || -1;

export function setActiveState<T extends {active?: boolean}>(args: {
    element: BaseType;
    datum: T;
    state: BasicInactiveState | undefined;
    active: boolean;
}) {
    const {element, datum, state, active} = args;
    const elementSelection = select<BaseType, T>(element);

    if (datum.active !== active) {
        datum.active = active;
        const opacity = datum.active ? null : state?.opacity;
        elementSelection.attr('opacity', opacity || null);
    }

    return datum;
}

export const getLineDashArray = (dashStyle: DashStyle, strokeWidth = 2) => {
    const value = dashStyle.toLowerCase();

    const arrayValue = value
        .replace('shortdashdotdot', '3,1,1,1,1,1,')
        .replace('shortdashdot', '3,1,1,1')
        .replace('shortdot', '1,1,')
        .replace('shortdash', '3,1,')
        .replace('longdash', '8,3,')
        .replace(/dot/g, '1,3,')
        .replace('dash', '4,3,')
        .replace(/,$/, '')
        .split(',')
        .map((part) => {
            return `${parseInt(part, 10) * strokeWidth}`;
        });

    return arrayValue.join(',').replace(/NaN/g, 'none');
};
