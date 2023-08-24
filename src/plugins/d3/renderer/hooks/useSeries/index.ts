import React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import get from 'lodash/get';
import {ScaleOrdinal, scaleOrdinal} from 'd3';

import type {
    ChartKitWidgetData,
    ChartKitWidgetSeries,
    PieSeries,
    PieSeriesData,
} from '../../../../../types/widget-data';

import {DEFAULT_PALETTE} from '../../constants';
import {getSeriesNames, isAxisRelatedSeries} from '../../utils';
import {PreparedLegend} from '../useChartOptions/types';
import {getActiveLegendItems, getAllLegendItems, prepareLegendSymbol} from './utils';
import {PreparedSeries} from './types';

export type OnLegendItemClick = (data: {name: string; metaKey: boolean}) => void;

type Args = {
    legend: PreparedLegend;
    series: ChartKitWidgetData['series'];
};

const prepareAxisRelatedSeries = (args: {
    activeLegendItems: string[];
    colorScale: ScaleOrdinal<string, string>;
    series: ChartKitWidgetSeries;
    legend: PreparedLegend;
}) => {
    const {activeLegendItems, colorScale, series, legend} = args;
    const preparedSeries = cloneDeep(series) as PreparedSeries;
    const legendEnabled = get(preparedSeries, 'legend.enabled', legend.enabled);
    const defaultVisible = get(preparedSeries, 'visible', true);
    const name = 'name' in series && series.name ? series.name : '';
    const color = 'color' in series && series.color ? series.color : colorScale(name);
    preparedSeries.color = color;
    preparedSeries.name = name;
    preparedSeries.visible = legendEnabled ? activeLegendItems.includes(name) : defaultVisible;
    preparedSeries.legend = {
        enabled: legendEnabled,
        symbol: prepareLegendSymbol(preparedSeries),
    };

    return preparedSeries;
};

const preparePieSeries = (args: {
    activeLegendItems: string[];
    series: PieSeries;
    legend: PreparedLegend;
}) => {
    const {activeLegendItems, series, legend} = args;
    const preparedSeries = cloneDeep(series) as PreparedSeries;
    const legendEnabled = get(preparedSeries, 'legend.enabled', legend.enabled);
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
    preparedSeries.legend = {
        enabled: legendEnabled,
        symbol: prepareLegendSymbol(preparedSeries),
    };

    return preparedSeries;
};

const prepareNotAxisRelatedSeries = (args: {
    activeLegendItems: string[];
    series: ChartKitWidgetSeries;
    legend: PreparedLegend;
}) => {
    const {activeLegendItems, series, legend} = args;

    switch (series.type) {
        case 'pie': {
            return preparePieSeries({activeLegendItems, series, legend});
        }
        default: {
            throw new Error(
                `Series type ${series.type} does not support data preparation for series that do not support the presence of axes`,
            );
        }
    }
};

export const useSeries = (args: Args) => {
    const {
        series: {data: series},
        legend,
    } = args;
    const [activeLegendItems, setActiveLegendItems] = React.useState(getActiveLegendItems(series));

    // FIXME: remove effect. It initiates extra rerender
    React.useEffect(() => {
        setActiveLegendItems(getActiveLegendItems(series));
    }, [series]);

    const chartSeries = React.useMemo<PreparedSeries[]>(() => {
        const seriesNames = getSeriesNames(series);
        const colorScale = scaleOrdinal(seriesNames, DEFAULT_PALETTE);

        return series.map((s) => {
            return isAxisRelatedSeries(s)
                ? prepareAxisRelatedSeries({activeLegendItems, colorScale, series: s, legend})
                : prepareNotAxisRelatedSeries({
                      activeLegendItems,
                      series: s,
                      legend,
                  });
        });
    }, [activeLegendItems, series]);

    const handleLegendItemClick: OnLegendItemClick = React.useCallback(
        ({name, metaKey}) => {
            const onlyItemSelected =
                activeLegendItems.length === 1 && activeLegendItems.includes(name);
            let nextActiveLegendItems: string[];

            if (metaKey && activeLegendItems.includes(name)) {
                nextActiveLegendItems = activeLegendItems.filter((item) => item !== name);
            } else if (metaKey && !activeLegendItems.includes(name)) {
                nextActiveLegendItems = activeLegendItems.concat(name);
            } else if (onlyItemSelected) {
                nextActiveLegendItems = getAllLegendItems(series);
            } else {
                nextActiveLegendItems = [name];
            }

            setActiveLegendItems(nextActiveLegendItems);
        },
        [series, activeLegendItems],
    );

    return {chartSeries, handleLegendItemClick};
};
