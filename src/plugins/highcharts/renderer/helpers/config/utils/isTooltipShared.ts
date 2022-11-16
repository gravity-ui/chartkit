// In case of using 'sankey' or 'xrange', the shared property must be set to false, otherwise the tooltip behaves incorrectly:
// Point.onMouseOver -> Highcharts.Pointer.runPointActions -> H.Tooltip.refresh -> Cannot read property 'series' of undefined
export const isTooltipShared = (chartType: string) => {
    if (['sankey', 'xrange'].includes(chartType)) {
        return false;
    }

    return true;
};
