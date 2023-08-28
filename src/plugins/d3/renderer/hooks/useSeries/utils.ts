import {PreparedSeries} from './types';

export const getActiveLegendItems = (series: PreparedSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        if (s.legend.enabled && s.visible) {
            acc.push(s.name);
        }

        return acc;
    }, []);
};

export const getAllLegendItems = (series: PreparedSeries[]) => {
    return series.map((s) => s.name);
};
