import type {ScaleBand, ScaleLinear, ScaleTime} from 'd3';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';

import type {WaterfallSeriesData} from '../../../../../../types';
import {LabelData} from '../../../types';
import {getLabelsSize} from '../../../utils';
import type {ChartScale} from '../../useAxisScales';
import type {PreparedAxis} from '../../useChartOptions/types';
import type {PreparedSeriesOptions, PreparedWaterfallSeries} from '../../useSeries/types';
import {MIN_BAR_WIDTH} from '../constants';
import {getXValue, getYValue} from '../utils';

import {PreparedWaterfallData} from './types';

function getLabelData(d: PreparedWaterfallData): LabelData | undefined {
    if (!d.series.dataLabels.enabled) {
        return undefined;
    }

    const text = String(d.data.label || d.data.y);
    const style = d.series.dataLabels.style;
    const {maxHeight: height, maxWidth: width} = getLabelsSize({labels: [text], style});

    let y = Math.max(height, d.y - d.series.dataLabels.padding);
    if (d.series.dataLabels.inside) {
        y = d.y + d.height / 2;
    }

    return {
        text,
        x: d.x + d.width / 2,
        y,
        style,
        size: {width, height},
        textAnchor: 'middle',
        series: d.series,
    };
}

function getBandWidth(args: {
    series: PreparedWaterfallSeries[];
    xAxis: PreparedAxis;
    xScale: ChartScale;
}) {
    const {series, xAxis, xScale} = args;

    if (xAxis.type === 'category') {
        const xBandScale = xScale as ScaleBand<string>;
        return xBandScale.bandwidth();
    }

    const xLinearScale = xScale as ScaleLinear<number, number> | ScaleTime<number, number>;
    const xValues = series.reduce<number[]>((acc, s) => {
        s.data.forEach((dataItem) => acc.push(Number(dataItem.x)));
        return acc;
    }, []);

    let bandWidth = Infinity;
    xValues.sort().forEach((xValue, index) => {
        if (index > 0 && xValue !== xValues[index - 1]) {
            const dist = xLinearScale(xValue) - xLinearScale(xValues[index - 1]);
            if (dist < bandWidth) {
                bandWidth = dist;
            }
        }
    });

    return bandWidth;
}

export const prepareWaterfallData = (args: {
    series: PreparedWaterfallSeries[];
    seriesOptions: PreparedSeriesOptions;
    xAxis: PreparedAxis;
    xScale: ChartScale;
    yAxis: PreparedAxis;
    yScale: ChartScale;
}): PreparedWaterfallData[] => {
    const {series, seriesOptions, xAxis, xScale, yAxis, yScale} = args;
    const yLinearScale = yScale as ScaleLinear<number, number>;
    const plotHeight = yLinearScale(yLinearScale.domain()[0]);
    const barMaxWidth = get(seriesOptions, 'bar-x.barMaxWidth');

    const data: {data: WaterfallSeriesData; series: PreparedWaterfallSeries}[] = sortBy(
        series.reduce((acc, s) => {
            Array.prototype.push.apply(
                acc,
                s.data.map((d) => ({data: d, series: s})),
            );
            return acc;
        }, []),
        (d) => d.data.x,
    );

    const bandWidth = getBandWidth({
        series,
        xAxis,
        xScale,
    });
    const rectWidth = Math.max(MIN_BAR_WIDTH, Math.min(bandWidth, barMaxWidth));

    let totalValue = 0;
    const result: PreparedWaterfallData[] = [];
    data.forEach((item, _index) => {
        if (typeof item.data.y !== 'number' && !item.data.total) {
            return;
        }

        if (!item.data.total) {
            totalValue += Number(item.data.y);
        }

        const prevPoint = result[result.length - 1];
        const xCenter = getXValue({point: item.data, xAxis, xScale});
        const x = xCenter - rectWidth / 2;
        const yValue = Number(item.data.total ? totalValue : item.data.y);
        const height =
            plotHeight -
            getYValue({
                point: {y: Math.abs(yValue)},
                yScale,
                yAxis,
            });

        let y;
        if (!prevPoint || item.data.total) {
            y = getYValue({
                point: {
                    y: yValue,
                },
                yScale,
                yAxis,
            });
        } else if (prevPoint.data.y < 0) {
            if (item.data.y > 0) {
                y = prevPoint.y + prevPoint.height - height;
            } else {
                y = prevPoint.y + prevPoint.height;
            }
        } else if (item.data.y < 0) {
            y = prevPoint.y;
        } else {
            y = prevPoint.y - height;
        }

        const preparedData: PreparedWaterfallData = {
            x,
            y: y,
            width: rectWidth,
            height,
            opacity: get(item.data, 'opacity', null),
            data: item.data.total ? {...item.data, y: totalValue} : item.data,
            series: item.series,
            total: item.data.total,
        };

        preparedData.label = getLabelData(preparedData);

        result.push(preparedData);
    });

    return result;
};
