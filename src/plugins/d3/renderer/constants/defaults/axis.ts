import {ChartKitWidgetAxisType} from '../../../../../types';

export const axisLabelsDefaults = {
    margin: 10,
    padding: 10,
    fontSize: 11,
    maxWidth: 80,
};

const axisTitleDefaults = {
    fontSize: '14px',
};

export const xAxisTitleDefaults = {
    ...axisTitleDefaults,
    margin: 4,
};

export const yAxisTitleDefaults = {
    ...axisTitleDefaults,
    margin: 8,
};

export const DEFAULT_AXIS_TYPE: ChartKitWidgetAxisType = 'linear';
