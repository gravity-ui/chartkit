import type {Highcharts} from '../../../../types';

export const isNavigatorSeries = (series?: Highcharts.Series | Highcharts.Point) => {
    return series?.options.className === 'highcharts-navigator-series';
};
