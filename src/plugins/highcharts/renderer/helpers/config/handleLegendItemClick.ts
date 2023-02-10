import {drawComments, hideComments} from '../comments/drawing';
import {isNavigatorSeries} from './utils';
import Highcharts from 'highcharts';

type LegendItemClickType = 'extended' | 'default';

const getSeriesIdentifier = (series: Highcharts.Series): string => {
    return (series.userOptions.id as string | undefined) || series.name;
};

const needSetVisible = (
    seriesName: string,
    seriesVisible: boolean,
    chartSeries: Highcharts.Series[],
) => {
    if (!seriesVisible) {
        return false;
    }

    const hasAnotherVisibleSeries = chartSeries
        .filter(
            (series) =>
                series.options.showInLegend !== false && getSeriesIdentifier(series) !== seriesName,
        )
        .some((series) => series.visible);

    return seriesVisible && !hasAnotherVisibleSeries;
};

const updateSeries = (
    series: Highcharts.Series,
    chartSeries: Highcharts.Series[],
    type: LegendItemClickType,
) => {
    const clickedSeriesName = getSeriesIdentifier(series);
    switch (type) {
        case 'extended': {
            chartSeries.forEach((item) => {
                if (getSeriesIdentifier(item) === clickedSeriesName) {
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

            chartSeries.forEach((item) => {
                if (getSeriesIdentifier(item) === clickedSeriesName) {
                    item.setVisible(true, false);
                } else {
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
export const handleLegendItemClick = (event: Highcharts.SeriesLegendItemClickEventObject) => {
    event.preventDefault();

    const series = event.target;
    const chart: Highcharts.Chart = series.chart ? series.chart : (series as any).series.chart;
    const chartSeries: Highcharts.Series[] = series.chart
        ? chart.series
        : (series as any).series.data;

    if (isNavigatorSeries(series)) {
        return;
    }

    const isExtended = event.browserEvent.ctrlKey || event.browserEvent.metaKey;
    const type: LegendItemClickType = isExtended ? 'extended' : 'default';

    updateSeries(series, chartSeries, type);
    updateComments(chart);
    chart.redraw();
};
