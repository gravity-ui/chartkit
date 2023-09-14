import type {PreparedAxis, PreparedChart} from '../../hooks';

export const getBoundsWidth = (args: {
    chartWidth: number;
    chartMargin: PreparedChart['margin'];
    preparedYAxis: PreparedAxis[];
}) => {
    const {chartWidth, chartMargin, preparedYAxis} = args;
    const yAxisTitleHeight =
        preparedYAxis.reduce((acc, axis) => {
            return acc + (axis.title.height || 0);
        }, 0) || 0;

    return chartWidth - chartMargin.right - chartMargin.left - yAxisTitleHeight;
};
