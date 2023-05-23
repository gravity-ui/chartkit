import {HighchartsWidgetData} from '../../../../types';

// In case of using 'sankey' or 'xrange', the shared property must be set to false, otherwise the tooltip behaves incorrectly:
// Point.onMouseOver -> Highcharts.Pointer.runPointActions -> H.Tooltip.refresh -> Cannot read property 'series' of undefined
export const isTooltipShared = (chartType: string) => {
    if (['sankey', 'xrange'].includes(chartType)) {
        return false;
    }

    return true;
};

export const checkTooltipPinningAvailability = (
    args: {
        tooltip?: HighchartsWidgetData['config']['tooltip'];
        altKey?: boolean;
        metaKey?: boolean;
    } = {},
) => {
    const {tooltip, altKey, metaKey} = args;
    const enabled = tooltip?.pin?.enabled ?? true;
    const shouldAltKeyBePressed = tooltip?.pin?.altKey ?? false;
    const shouldMetaKeyBePressed = tooltip?.pin?.metaKey ?? false;

    if (!enabled) {
        return false;
    }

    if (shouldAltKeyBePressed && !altKey) {
        return false;
    }

    if (shouldMetaKeyBePressed && !metaKey) {
        return false;
    }

    return true;
};
