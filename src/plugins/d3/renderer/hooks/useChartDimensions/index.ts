import type {ChartMargin} from '../../../../../types/widget-data';

import type {PreparedAxis, PreparedLegend, PreparedTitle} from '../useChartOptions/types';

type Args = {
    width: number;
    height: number;
    margin: ChartMargin;
    legend: PreparedLegend;
    title?: PreparedTitle;
    xAxis?: PreparedAxis;
    yAxis?: PreparedAxis[];
};

export const useChartDimensions = (args: Args) => {
    const {margin, legend, title, width, height, xAxis, yAxis} = args;
    const titleHeight = title?.height || 0;
    const xAxisTitleHeight = xAxis?.title.height || 0;
    const yAxisTitleHeight =
        yAxis?.reduce((acc, axis) => {
            return acc + (axis.title.height || 0);
        }, 0) || 0;

    const boundsWidth = width - margin.right - margin.left - yAxisTitleHeight;
    const boundsHeight =
        height - margin.top - margin.bottom - legend.height - titleHeight - xAxisTitleHeight;

    return {boundsWidth, boundsHeight, legendHeight: legend.height};
};
