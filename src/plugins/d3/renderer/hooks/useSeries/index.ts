import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import {ScaleOrdinal, scaleOrdinal} from 'd3';

import type {
    ChartKitWidgetSeries,
    PieSeries,
    PieSeriesData,
} from '../../../../../types/widget-data';

import {DEFAULT_PALETTE} from '../../constants';
import {getSeriesNames, isAxisRelatedSeries} from '../../utils';

export type ChartSeries = ChartKitWidgetSeries & {
    color: string;
    name: string;
    visible: boolean;
};

type Args = {
    activeLegendItems: string[];
    series: ChartKitWidgetSeries[];
};

const prepareAxisRelatedSeries = (args: {
    activeLegendItems: string[];
    colorScale: ScaleOrdinal<string, string>;
    series: ChartKitWidgetSeries;
}) => {
    const {activeLegendItems, colorScale, series} = args;
    const preparedSeries = cloneDeep(series) as ChartSeries;
    const legendEnabled = get(preparedSeries, 'legend.enabled', true);
    const defaultVisible = get(preparedSeries, 'visible', true);
    const name = 'name' in series && series.name ? series.name : '';
    const color = 'color' in series && series.color ? series.color : colorScale(name);
    preparedSeries.color = color;
    preparedSeries.name = name;
    preparedSeries.visible = legendEnabled ? activeLegendItems.includes(name) : defaultVisible;

    return preparedSeries;
};

const preparePieSeries = (args: {activeLegendItems: string[]; series: PieSeries}) => {
    const {activeLegendItems, series} = args;
    const preparedSeries = cloneDeep(series) as ChartSeries;
    const legendEnabled = get(preparedSeries, 'legend.enabled', true);
    const dataNames = series.data.map((d) => d.name);
    const colorScale = scaleOrdinal(dataNames, DEFAULT_PALETTE);
    preparedSeries.data = (preparedSeries.data as PieSeriesData[]).map((d) => {
        const defaultVisible = get(d, 'visible', true);
        d.color = d.color || colorScale(d.name);
        d.visible = legendEnabled ? activeLegendItems.includes(d.name) : defaultVisible;
        return d;
    });

    // Not axis related series manages their own data visibility inside their data
    preparedSeries.visible = true;

    return preparedSeries;
};

const prepareNotAxisRelatedSeries = (args: {
    activeLegendItems: string[];
    series: ChartKitWidgetSeries;
}) => {
    const {activeLegendItems, series} = args;

    switch (series.type) {
        case 'pie': {
            return preparePieSeries({activeLegendItems, series});
        }
        default: {
            throw new Error(
                `Series type ${series.type} does not support data preparation for series that do not support the presence of axes`,
            );
        }
    }
};

export const useSeries = (args: Args) => {
    const {activeLegendItems, series} = args;
    const chartSeries = React.useMemo<ChartSeries[]>(() => {
        const seriesNames = getSeriesNames(series);
        const colorScale = scaleOrdinal(seriesNames, DEFAULT_PALETTE);

        return series.map((s) => {
            return isAxisRelatedSeries(s)
                ? prepareAxisRelatedSeries({activeLegendItems, colorScale, series: s})
                : prepareNotAxisRelatedSeries({
                      activeLegendItems,
                      series: s,
                  });
        });
    }, [activeLegendItems, series]);

    return {chartSeries};
};
