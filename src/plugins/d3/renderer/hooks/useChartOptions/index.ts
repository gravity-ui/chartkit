import React from 'react';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import {getPreparedChart} from './chart';
import {getPreparedTitle} from './title';
import {getPreparedTooltip} from './tooltip';
import {getPreparedXAxis} from './x-axis';
import {getPreparedYAxis} from './y-axis';
import type {ChartOptions} from './types';

type Args = ChartKitWidgetData;

export const useChartOptions = (args: Args): ChartOptions => {
    const {chart, series, title, tooltip, xAxis, yAxis} = args;
    const options: ChartOptions = React.useMemo(() => {
        const preparedTitle = getPreparedTitle({title});
        const preparedTooltip = getPreparedTooltip({tooltip});
        const preparedYAxis = getPreparedYAxis({yAxis});
        const preparedXAxis = getPreparedXAxis({xAxis});
        const preparedChart = getPreparedChart({
            chart,
            series,
            preparedTitle,
            preparedY1Axis: preparedYAxis[0],
        });
        return {
            chart: preparedChart,
            title: preparedTitle,
            tooltip: preparedTooltip,
            xAxis: preparedXAxis,
            yAxis: preparedYAxis,
        };
    }, [chart, title, tooltip, series, xAxis, yAxis]);

    return options;
};
