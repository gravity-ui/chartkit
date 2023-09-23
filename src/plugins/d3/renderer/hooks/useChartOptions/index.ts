import React from 'react';

import type {ChartKitWidgetData} from '../../../../../types';

import {getPreparedChart} from './chart';
import {getPreparedTitle} from './title';
import {getPreparedTooltip} from './tooltip';
import {getPreparedYAxis} from './y-axis';
import type {ChartOptions} from './types';

type Args = {
    data: ChartKitWidgetData;
};

export const useChartOptions = (args: Args): ChartOptions => {
    const {
        data: {chart, series, title, tooltip, yAxis},
    } = args;
    const options: ChartOptions = React.useMemo(() => {
        const preparedTitle = getPreparedTitle({title});
        const preparedTooltip = getPreparedTooltip({tooltip});
        const preparedYAxis = getPreparedYAxis({series: series.data, yAxis});
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
            yAxis: preparedYAxis,
        };
    }, [chart, title, tooltip, series, yAxis]);

    return options;
};
