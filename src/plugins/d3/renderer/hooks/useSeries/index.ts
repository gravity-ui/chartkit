import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import {ScaleOrdinal, scaleOrdinal} from 'd3';

import type {ChartKitWidgetSeries, PieSeries} from '../../../../../types/widget-data';

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
    const name = 'name' in series && series.name ? series.name : '';
    const color = 'color' in series && series.color ? series.color : colorScale(name);
    preparedSeries.color = color;
    preparedSeries.name = name;
    preparedSeries.visible = activeLegendItems.includes(name);

    return preparedSeries;
};

const preparePieSeries = (args: {
    activeLegendItems: string[];
    onlySeries: boolean;
    series: PieSeries;
}) => {
    const {activeLegendItems, onlySeries, series} = args;
    const preparedSeries = cloneDeep(series) as ChartSeries;
    const dataNames = series.data.map((d) => d.name);
    const colorScale = scaleOrdinal(dataNames, DEFAULT_PALETTE);
    preparedSeries.data = series.data.map((d) => {
        const nextData = cloneDeep(d);
        nextData.color = nextData.color || colorScale(nextData.name);
        nextData.visible = onlySeries ? activeLegendItems.includes(nextData.name) : true;

        return nextData;
    });

    preparedSeries.visible = onlySeries ? true : activeLegendItems.includes(preparedSeries.name);

    return preparedSeries;
};

const prepareNotAxisRelatedSeries = (args: {
    activeLegendItems: string[];
    onlySeries: boolean;
    series: ChartKitWidgetSeries;
}) => {
    const {activeLegendItems, onlySeries, series} = args;

    switch (series.type) {
        case 'pie': {
            return preparePieSeries({activeLegendItems, onlySeries, series});
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
                      onlySeries: series.length === 1,
                      series: s,
                  });
        });
    }, [activeLegendItems, series]);

    return {chartSeries};
};
