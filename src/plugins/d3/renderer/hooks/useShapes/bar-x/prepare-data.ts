import {ascending, descending, max, sort} from 'd3';
import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';

import {TooltipDataChunkType} from '../../../../../../constants';
import type {BarXSeriesData, TooltipDataChunkBarX} from '../../../../../../types';

import {getDataCategoryValue} from '../../../utils';
import type {ChartScale} from '../../useAxisScales';
import type {ChartOptions} from '../../useChartOptions/types';
import type {PreparedBarXSeries, PreparedSeriesOptions} from '../../useSeries/types';

const MIN_RECT_WIDTH = 1;
const MIN_RECT_GAP = 1;
const MIN_GROUP_GAP = 1;

export type PreparedBarXData = Omit<TooltipDataChunkBarX, 'series'> & {
    x: number;
    y: number;
    width: number;
    height: number;
    series: PreparedBarXSeries;
};

export const prepareBarXData = (args: {
    series: PreparedBarXSeries[];
    seriesOptions: PreparedSeriesOptions;
    xAxis: ChartOptions['xAxis'];
    xScale: ChartScale;
    yAxis: ChartOptions['yAxis'];
    yScale: ChartScale;
}): PreparedBarXData[] => {
    const {series, seriesOptions, xAxis, xScale, yScale} = args;
    const categories = get(xAxis, 'categories', [] as string[]);
    const barMaxWidth = get(seriesOptions, 'bar-x.barMaxWidth');
    const barPadding = get(seriesOptions, 'bar-x.barPadding');
    const groupPadding = get(seriesOptions, 'bar-x.groupPadding');
    const sortingOptions = get(seriesOptions, 'bar-x.dataSorting');
    const comparator = sortingOptions?.direction === 'desc' ? descending : ascending;
    const sortKey = (() => {
        switch (sortingOptions?.key) {
            case 'y': {
                return 'data.y';
            }
            case 'name': {
                return 'series.name';
            }
            default: {
                return undefined;
            }
        }
    })();

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
    const rectWidth = Math.max(
        MIN_RECT_WIDTH,
        Math.min(groupWidth / maxGroupSize - rectGap, barMaxWidth),
    );

    const result: PreparedBarXData[] = [];

    Object.entries(data).forEach(([xValue, val]) => {
        const stacks = Object.values(val);
        const currentGroupWidth = rectWidth * stacks.length + rectGap * (stacks.length - 1);
        stacks.forEach((yValues, groupItemIndex) => {
            let stackHeight = 0;

            const sortedData = sortKey
                ? sort(yValues, (a, b) => comparator(get(a, sortKey), get(b, sortKey)))
                : yValues;
            sortedData.forEach((yValue) => {
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
                    type: TooltipDataChunkType.BAR_X,
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
};
