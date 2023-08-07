import get from 'lodash/get';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import type {PreparedTooltip} from './types';

export const getPreparedTooltip = (args: {
    tooltip: ChartKitWidgetData['tooltip'];
}): PreparedTooltip => {
    const {tooltip} = args;

    return {
        ...tooltip,
        enabled: get(tooltip, 'enabled', true),
    };
};
