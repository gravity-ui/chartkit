import type {ScaleOrdinal} from 'd3';
import get from 'lodash/get';
import type {BarYSeries} from '../../../../../types';
import type {PreparedBarYSeries, PreparedLegend, PreparedSeries} from './types';
import {getRandomCKId} from '../../../../../utils';
import {prepareLegendSymbol} from './utils';
import {DEFAULT_DATALABELS_STYLE} from './constants';
import {getHorisontalSvgTextHeight} from '../../utils';

type PrepareBarYSeriesArgs = {
    colorScale: ScaleOrdinal<string, string>;
    series: BarYSeries[];
    legend: PreparedLegend;
};

export function prepareBarYSeries(args: PrepareBarYSeriesArgs): PreparedSeries[] {
    const {colorScale, series: seriesList, legend} = args;
    const commonStackId = getRandomCKId();

    return seriesList.map<PreparedBarYSeries>((series) => {
        const name = series.name || '';
        const color = series.color || colorScale(name);

        let stackId = series.stackId;
        if (!stackId) {
            stackId = series.stacking === 'normal' ? commonStackId : getRandomCKId();
        }

        const dataLabelStyle = Object.assign(
            {},
            DEFAULT_DATALABELS_STYLE,
            series.dataLabels?.style,
        );

        return {
            type: series.type,
            color: color,
            name: name,
            id: getRandomCKId(),
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
                style: dataLabelStyle,
                height: getHorisontalSvgTextHeight({text: 'Tmp', style: dataLabelStyle}),
            },
        };
    }, []);
}
