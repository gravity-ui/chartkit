import type {TooltipDataChunkScatter, ScatterSeriesData} from '../../../../../../types';

import type {ChartScale} from '../../useAxisScales';
import type {PreparedAxis} from '../../useChartOptions/types';
import {PreparedScatterSeries} from '../../useSeries/types';
import {getXValue, getYValue} from '../utils';

const DEFAULT_SCATTER_POINT_SIZE = 7;

export type PreparedScatterData = Omit<TooltipDataChunkScatter, 'series'> & {
    cx: number;
    cy: number;
    series: PreparedScatterSeries;
    hovered: boolean;
    active: boolean;
    id: number;
    size: number;
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
}): PreparedScatterData[] => {
    const {series, xAxis, xScale, yAxis, yScale} = args;

    return series.reduce<PreparedScatterData[]>((acc, s) => {
        const filteredData =
            xAxis.type === 'category' || yAxis.type === 'category'
                ? s.data
                : getFilteredLinearScatterData(s.data);

        filteredData.forEach((d) => {
            const size = d.radius ? d.radius * 2 : DEFAULT_SCATTER_POINT_SIZE;

            acc.push({
                data: d,
                series: s,
                cx: getXValue({point: d, xAxis, xScale}),
                cy: getYValue({point: d, yAxis, yScale}),
                hovered: false,
                active: true,
                id: acc.length - 1,
                size,
            });
        });

        return acc;
    }, []);
};
