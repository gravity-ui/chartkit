import {drawComments, hideComments} from '../comments/drawing';
import {isNavigatorSeries} from './utils';

const needSetVisible = (serieName, serieVisible, chartSeries) => {
    if (!serieVisible) {
        return false;
    }

    const hasAnotherVisibleSeries = chartSeries
        .filter((serie) => serie.options.showInLegend !== false && serie.name !== serieName)
        .some((serie) => serie.visible);

    return serieVisible && !hasAnotherVisibleSeries;
};

const updateSeries = (serie, chart, chartSeries, type) => {
    const serieName = serie.name;
    switch (type) {
        case 'extended': {
            chartSeries.forEach((item) => {
                if (item.name === serieName) {
                    item.setVisible(!item.visible, false);
                }
            });

            break;
        }

        case 'default': {
            const visible = needSetVisible(serie.name, serie.visible, chartSeries);

            chartSeries.forEach((item) => {
                if (item.name === serieName) {
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

const updateComments = (chart) => {
    setTimeout(
        () => hideComments(chart, chart.userOptions._getComments(), chart.userOptions._config),
        0,
    );
    setTimeout(
        () => drawComments(chart, chart.userOptions._getComments(), chart.userOptions._config),
        0,
    );
};

// https://api.highcharts.com/class-reference/Highcharts#.SeriesLegendItemClickCallbackFunction
export const handleLegendItemClick = (event) => {
    event.preventDefault();

    const serie = event.target;
    const chart = serie.chart ? serie.chart : serie.series.chart;
    const chartSeries = serie.chart ? chart.series : serie.series.data;

    if (isNavigatorSeries(serie)) {
        return;
    }

    const isExteded = event.browserEvent.ctrlKey || event.browserEvent.metaKey;
    const type = isExteded ? 'extended' : 'default';

    updateSeries(serie, chart, chartSeries, type);
    updateComments(chart);
    chart.redraw();
};
