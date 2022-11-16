import type {Highcharts} from '../../../../types';

export const isNavigatorSeries = (series?: Highcharts.Series) => {
    return series?.options.className === 'highcharts-navigator-series';
};
