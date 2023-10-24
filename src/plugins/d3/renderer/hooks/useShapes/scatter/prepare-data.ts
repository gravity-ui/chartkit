import type {TooltipDataChunkScatter, ScatterSeriesData} from '../../../../../../types';

import type {ChartScale} from '../../useAxisScales';
import type {PreparedAxis} from '../../useChartOptions/types';
import {PreparedScatterSeries} from '../../useSeries/types';
import {getXValue, getYValue} from '../utils';

export type PreparedScatterData = Omit<TooltipDataChunkScatter, 'series'> & {
    cx: number;
    cy: number;
    series: PreparedScatterSeries;
    hovered: boolean;
    active: boolean;
    id: number;
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
            acc.push({
                data: d,
                series: s,
                cx: getXValue({point: d, xAxis, xScale}),
                cy: getYValue({point: d, yAxis, yScale}),
                hovered: false,
                active: true,
                id: acc.length - 1,
            });
        });

        return acc;
    }, []);
};
