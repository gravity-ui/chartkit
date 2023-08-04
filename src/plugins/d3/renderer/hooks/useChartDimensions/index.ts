import type {ChartMargin} from '../../../../../types/widget-data';

import type {ChartOptions, PreparedTitle} from '../useChartOptions';

const LEGEND_LINE_HEIGHT = 15;

type Args = {
    width: number;
    height: number;
    margin: ChartMargin;
    legend: ChartOptions['legend'];
    title?: PreparedTitle;
};

export const useChartDimensions = (args: Args) => {
    const {margin, legend, title, width, height} = args;
    const legendHeight = legend.enabled ? LEGEND_LINE_HEIGHT : 0;
    const titleHeight = title?.height || 0;
    const boundsWidth = width - margin.right - margin.left;
    const boundsHeight = height - margin.top - margin.bottom - legendHeight - titleHeight;

    return {boundsWidth, boundsHeight, legendHeight};
};
