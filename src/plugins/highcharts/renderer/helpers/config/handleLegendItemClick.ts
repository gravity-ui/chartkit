import Highcharts from 'highcharts';

import {drawComments, hideComments} from '../comments/drawing';

import {isNavigatorSeries} from './utils';

type LegendItemClickType = 'extended' | 'default';

const getSeriesIdentifier = (item: Highcharts.Series | Highcharts.Point): string => {
    if (item instanceof Highcharts.Point) {
        return item.name;
    }

    if (isNavigatorSeries(item) && item.baseSeries) {
        return (item.baseSeries.userOptions.id as string | undefined) || item.baseSeries.name;
    }

    return (item.userOptions.id as string | undefined) || item.name;
};

const needSetVisible = (
    seriesName: string,
    seriesVisible: boolean,
    chartSeries: Highcharts.Series[] | Highcharts.Point[],
) => {
    if (!seriesVisible) {
        return false;
    }

    // TypeScript have problems when filter/map/reduce with union type arrays.
    // https://github.com/microsoft/TypeScript/issues/44373
    const hasAnotherVisibleSeries = (chartSeries as (Highcharts.Point | Highcharts.Series)[])
        .filter(
            (series: Highcharts.Series | Highcharts.Point) =>
                series.options.showInLegend !== false && getSeriesIdentifier(series) !== seriesName,
        )
        .some((series) => series.visible);

    return seriesVisible && !hasAnotherVisibleSeries;
};

const updateSeries = (
    series: Highcharts.Series | Highcharts.Point,
    chartSeries: Highcharts.Series[] | Highcharts.Point[],
    type: LegendItemClickType,
) => {
    const clickedSeriesName = getSeriesIdentifier(series);
    switch (type) {
        case 'extended': {
            chartSeries.forEach((item: Highcharts.Series | Highcharts.Point) => {
                if (getSeriesIdentifier(item) === clickedSeriesName) {
                    // Highcharts.Series has serVisible in types
                    // Highcharts.Point doesn't have this method in types
                    // but it has this method in __proto__ and it works
                    // @ts-ignore
                    item.setVisible(!item.visible, false);
                }
            });

            break;
        }

        case 'default': {
            const visible = needSetVisible(
                getSeriesIdentifier(series),
                series.visible,
                chartSeries,
            );

            chartSeries.forEach((item: Highcharts.Series | Highcharts.Point) => {
                if (getSeriesIdentifier(item) === clickedSeriesName) {
                    // @ts-ignore
                    item.setVisible(true, false);
                } else {
                    // @ts-ignore
                    item.setVisible(visible, false);
                }
            });

            break;
        }

        default:
            break;
    }
};

const updateComments = (chart: Highcharts.Chart) => {
    setTimeout(
        () =>
            hideComments(
                chart,
                (chart.userOptions as any)._getComments(),
                (chart.userOptions as any)._config,
            ),
        0,
    );
    setTimeout(
        () =>
            drawComments(
                chart,
                (chart.userOptions as any)._getComments(),
                (chart.userOptions as any)._config,
            ),
        0,
    );
};

// https://api.highcharts.com/class-reference/Highcharts#.SeriesLegendItemClickCallbackFunction
export const handleLegendItemClick = (
    event: Highcharts.SeriesLegendItemClickEventObject | Highcharts.PointLegendItemClickEventObject,
) => {
    event.preventDefault();

    const series: Highcharts.Series | Highcharts.Point = event.target;

    const chart: Highcharts.Chart =
        series instanceof Highcharts.Point ? series.series.chart : series.chart;
    const chartSeries: Highcharts.Series[] | Highcharts.Point[] =
        series instanceof Highcharts.Point ? series.series.data : series.chart.series;

    if (isNavigatorSeries(series)) {
        return;
    }

    const isExtended = event.browserEvent.ctrlKey || event.browserEvent.metaKey;
    const type: LegendItemClickType = isExtended ? 'extended' : 'default';

    updateSeries(series, chartSeries, type);
    updateComments(chart);
    chart.redraw();
};
