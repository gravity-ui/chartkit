import React from 'react';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import {getPreparedChart} from './chart';
import {getPreparedLegend} from './legend';
import {getPreparedTitle} from './title';
import {getPreparedXAxis} from './x-axis';
import {getPreparedYAxis} from './y-axis';
import type {ChartOptions} from './types';

export const useChartOptions = (args: ChartKitWidgetData): ChartOptions => {
    const {chart, series, legend, title, xAxis, yAxis} = args;
    const options: ChartOptions = React.useMemo(() => {
        const preparedTitle = getPreparedTitle({title});
        const preparedLegend = getPreparedLegend({legend, series});
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
            xAxis: preparedXAxis,
            yAxis: preparedYAxis,
        };
    }, [chart, legend, title, series, xAxis, yAxis]);

    return options;
};
