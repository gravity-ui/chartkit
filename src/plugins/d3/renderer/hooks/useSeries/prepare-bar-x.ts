import type {ScaleOrdinal} from 'd3';
import get from 'lodash/get';
import type {BarXSeries} from '../../../../../types';
import type {PreparedBarXSeries, PreparedLegend, PreparedSeries} from './types';
import {getRandomCKId} from '../../../../../utils';
import {prepareLegendSymbol} from './utils';
import {DEFAULT_DATALABELS_STYLE} from './constants';

type PrepareBarXSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: BarXSeries[];
    legend: PreparedLegend;
};

export function prepareBarXSeries(args: PrepareBarXSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, legend} = args;
    const commonStackId = getRandomCKId();

    return seriesList.map<PreparedBarXSeries>((series) => {
        const name = series.name || '';
        const color = series.color || colorScale(name);

        let stackId = series.stackId;
        if (!stackId) {
            stackId = series.stacking === 'normal' ? commonStackId : getRandomCKId();
        }

        return {
            type: series.type,
            color: color,
            name: name,
            id: '',
            visible: get(series, 'visible', true),
            legend: {
                enabled: get(series, 'legend.enabled', legend.enabled),
                symbol: prepareLegendSymbol(series),
            },
            data: series.data,
            stacking: series.stacking,
            stackId,
            dataLabels: {
                enabled: series.dataLabels?.enabled || false,
                inside:
                    typeof series.dataLabels?.inside === 'boolean'
                        ? series.dataLabels?.inside
                        : false,
                style: Object.assign({}, DEFAULT_DATALABELS_STYLE, series.dataLabels?.style),
            },
        };
    }, []);
}
