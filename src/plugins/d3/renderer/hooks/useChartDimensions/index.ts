import type {ChartMargin} from '../../../../../types/widget-data';

import type {PreparedAxis} from '../useChartOptions/types';

type Args = {
    width: number;
    height: number;
    margin: ChartMargin;
    yAxis?: PreparedAxis[];
};

export const useChartDimensions = (args: Args) => {
    const {margin, width, height, yAxis} = args;
    const yAxisTitleHeight =
        yAxis?.reduce((acc, axis) => {
            return acc + (axis.title.height || 0);
        }, 0) || 0;

    const boundsWidth = width - margin.right - margin.left - yAxisTitleHeight;
    const boundsHeight = height - margin.top - margin.bottom;

    return {boundsWidth, boundsHeight};
};
