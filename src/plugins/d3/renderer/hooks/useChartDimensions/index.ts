import type {ChartMargin} from '../../../../../types/widget-data';

import type {ChartOptions, PreparedAxis, PreparedTitle} from '../useChartOptions/types';

const LEGEND_LINE_HEIGHT = 15;

type Args = {
    width: number;
    height: number;
    margin: ChartMargin;
    legend: ChartOptions['legend'];
    title?: PreparedTitle;
    xAxis?: PreparedAxis;
    yAxis?: PreparedAxis[];
};

export const useChartDimensions = (args: Args) => {
    const {margin, legend, title, width, height, xAxis, yAxis} = args;
    const legendHeight = legend.enabled ? LEGEND_LINE_HEIGHT : 0;
    const titleHeight = title?.height || 0;
    const xAxisTitleHeight = xAxis?.title.height || 0;
    const yAxisTitleHeight =
        yAxis?.reduce((acc, axis) => {
            return acc + (axis.title.height || 0);
        }, 0) || 0;

    const boundsWidth = width - margin.right - margin.left - yAxisTitleHeight;
    const boundsHeight =
        height - margin.top - margin.bottom - legendHeight - titleHeight - xAxisTitleHeight;

    return {boundsWidth, boundsHeight, legendHeight};
};
