import {PreparedLineSeries} from '../../useSeries/types';
import {PreparedAxis} from '../../useChartOptions/types';
import {ChartScale} from '../../useAxisScales';
import {PreparedLineData} from './types';
import {getXValue, getYValue} from '../utils';

export const prepareLineData = (args: {
    series: PreparedLineSeries[];
    xAxis: PreparedAxis;
    xScale: ChartScale;
    yAxis: PreparedAxis[];
    yScale: ChartScale;
}): PreparedLineData[] => {
    const {series, xAxis, xScale, yScale} = args;
    const yAxis = args.yAxis[0];

    return series.reduce<PreparedLineData[]>((acc, s) => {
        acc.push({
            points: s.data.map((d) => ({
                x: getXValue({point: d, xAxis, xScale}),
                y: getYValue({point: d, yAxis, yScale}),
                data: d,
            })),
            color: s.color,
            width: s.lineWidth,
            series: s,
            hovered: false,
            active: true,
            id: acc.length - 1,
        });

        return acc;
    }, []);
};
