import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import {TooltipDataChunkType} from '../../../../../../constants';
import type {TooltipDataChunkScatter, ScatterSeriesData} from '../../../../../../types/widget-data';

import {getDataCategoryValue} from '../../../utils';
import type {ChartScale} from '../../useAxisScales';
import type {PreparedAxis} from '../../useChartOptions/types';
import {PreparedScatterSeries} from '../../useSeries/types';

export type PreparedScatterData = Omit<TooltipDataChunkScatter, 'series'> & {
    cx: number;
    cy: number;
    series: PreparedScatterSeries;
};

const getCxAttr = (args: {point: ScatterSeriesData; xAxis: PreparedAxis; xScale: ChartScale}) => {
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
};

const getCyAttr = (args: {point: ScatterSeriesData; yAxis: PreparedAxis; yScale: ChartScale}) => {
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
};

const getFilteredLinearScatterData = (data: ScatterSeriesData[]) => {
    return data.filter((d) => typeof d.x === 'number' && typeof d.y === 'number');
};

export const prepareScatterData = (args: {
    series: PreparedScatterSeries[];
    xAxis: PreparedAxis;
    xScale: ChartScale;
    yAxis: PreparedAxis;
    yScale: ChartScale;
}): PreparedScatterData[][] => {
    const {series, xAxis, xScale, yAxis, yScale} = args;

    return series.reduce<PreparedScatterData[][]>((acc, s) => {
        const filteredData =
            xAxis.type === 'category' || yAxis.type === 'category'
                ? s.data
                : getFilteredLinearScatterData(s.data);
        const preparedData: PreparedScatterData[] = filteredData.map((d) => {
            return {
                type: TooltipDataChunkType.SCATTER,
                data: d,
                series: s,
                cx: getCxAttr({point: d, xAxis, xScale}),
                cy: getCyAttr({point: d, yAxis, yScale}),
            };
        });

        acc.push(preparedData);

        return acc;
    }, []);
};
