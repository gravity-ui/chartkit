import type {ChartMargin} from '../../../../../types/widget-data';

import type {PreparedAxis, PreparedLegend} from '../../hooks';
import {getHorisontalSvgTextHeight} from '../../utils';
import {getBoundsWidth} from './utils';

export {getBoundsWidth} from './utils';

type Args = {
    hasAxisRelatedSeries: boolean;
    width: number;
    height: number;
    margin: ChartMargin;
    preparedLegend: PreparedLegend;
    preparedXAxis: PreparedAxis;
    preparedYAxis: PreparedAxis[];
};

const getHeightOccupiedByXAxis = (preparedXAxis: PreparedAxis) => {
    let height = preparedXAxis.title.height;

    if (preparedXAxis.labels.enabled) {
        height +=
            preparedXAxis.labels.padding +
            getHorisontalSvgTextHeight({text: 'Tmp', style: preparedXAxis.labels.style});
    }

    return height;
};

const getBottomOffset = (args: {
    hasAxisRelatedSeries: boolean;
    preparedLegend: PreparedLegend;
    preparedXAxis: PreparedAxis;
}) => {
    const {hasAxisRelatedSeries, preparedLegend, preparedXAxis} = args;
    let result = preparedLegend.height + preparedLegend.paddingTop;

    if (hasAxisRelatedSeries) {
        result += getHeightOccupiedByXAxis(preparedXAxis);
    }

    return result;
};

export const useChartDimensions = (args: Args) => {
    const {
        hasAxisRelatedSeries,
        margin,
        width,
        height,
        preparedLegend,
        preparedXAxis,
        preparedYAxis,
    } = args;
    const bottomOffset = getBottomOffset({hasAxisRelatedSeries, preparedLegend, preparedXAxis});
    const boundsWidth = getBoundsWidth({chartWidth: width, chartMargin: margin, preparedYAxis});
    const boundsHeight = height - margin.top - margin.bottom - bottomOffset;

    return {boundsWidth, boundsHeight};
};
