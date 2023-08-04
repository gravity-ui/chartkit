import React from 'react';
import clone from 'lodash/clone';
import {scaleOrdinal} from 'd3';

import type {ChartKitWidgetSeries} from '../../../../../types/widget-data';

import {DEFAULT_PALETTE} from '../../components/constants';
import {getSeriesNames} from '../../components/utils';

export type ChartSeries = ChartKitWidgetSeries & {
    color: string;
    name: string;
    visible: boolean;
};

type Args = {
    activeLegendItems: string[];
    series: ChartKitWidgetSeries[];
};

export const useSeries = (args: Args) => {
    const {activeLegendItems, series} = args;
    // FIXME: handle case with one pie chart series
    const chartSeries = React.useMemo<ChartSeries[]>(() => {
        const seriesNames = getSeriesNames(series);
        const colorScale = scaleOrdinal(seriesNames, DEFAULT_PALETTE);

        return series.map((s) => {
            const preparedSeries = clone(s) as ChartSeries;
            const name = 'name' in s ? s.name : '';
            const color = 'color' in s && s.color ? s.color : colorScale(name);
            preparedSeries.color = color;
            preparedSeries.name = name;
            preparedSeries.visible = activeLegendItems.includes(name);

            return preparedSeries;
        });
    }, [activeLegendItems, series]);

    return {chartSeries};
};
