import React from 'react';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import {getPreparedChart} from './chart';
import {getPreparedLegend} from './legend';
import {getPreparedTitle} from './title';
import {getPreparedTooltip} from './tooltip';
import {getPreparedXAxis} from './x-axis';
import {getPreparedYAxis} from './y-axis';
import type {ChartOptions} from './types';
import {getPreparedSeries} from './series';

type Args = ChartKitWidgetData;

export const useChartOptions = (args: Args): ChartOptions => {
    const {chart, series, legend, title, tooltip, xAxis, yAxis} = args;
    const options: ChartOptions = React.useMemo(() => {
        const preparedTitle = getPreparedTitle({title});
        const preparedTooltip = getPreparedTooltip({tooltip});
        const preparedLegend = getPreparedLegend({legend, series});
        const preparedSeries = getPreparedSeries({series, legend: preparedLegend});
        const preparedYAxis = getPreparedYAxis({yAxis});
        const preparedXAxis = getPreparedXAxis({xAxis});
        const preparedChart = getPreparedChart({
            chart,
            series,
            preparedXAxis,
            preparedY1Axis: preparedYAxis[0],
        });
        return {
            chart: preparedChart,
            legend: preparedLegend,
            title: preparedTitle,
            tooltip: preparedTooltip,
            xAxis: preparedXAxis,
            yAxis: preparedYAxis,
            series: preparedSeries,
        };
    }, [chart, legend, title, tooltip, series, xAxis, yAxis]);

    return options;
};
