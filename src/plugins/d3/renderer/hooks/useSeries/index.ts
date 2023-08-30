import React from 'react';
import {group, scaleOrdinal} from 'd3';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import {DEFAULT_PALETTE} from '../../constants';
import {getSeriesNames} from '../../utils';
import {PreparedLegend} from '../useChartOptions/types';
import {getActiveLegendItems, getAllLegendItems} from './utils';
import {PreparedSeries} from './types';
import {prepareSeries} from './prepareSeries';

export type OnLegendItemClick = (data: {name: string; metaKey: boolean}) => void;

type Args = {
    legend: PreparedLegend;
    series: ChartKitWidgetData['series'];
};

export const useSeries = (args: Args) => {
    const {
        series: {data: series},
        legend,
    } = args;
    const preparedSeries = React.useMemo<PreparedSeries[]>(() => {
        const seriesNames = getSeriesNames(series);
        const colorScale = scaleOrdinal(seriesNames, DEFAULT_PALETTE);

        const groupedSeries = group(series, (item) => item.type);
        return Array.from(groupedSeries).reduce<PreparedSeries[]>(
            (acc, [seriesType, seriesList]) => {
                acc.push(
                    ...prepareSeries({
                        type: seriesType,
                        series: seriesList,
                        legend,
                        colorScale,
                    }),
                );
                return acc;
            },
            [],
        );
    }, [series, legend]);
    const [activeLegendItems, setActiveLegendItems] = React.useState(
        getActiveLegendItems(preparedSeries),
    );

    const chartSeries = React.useMemo<PreparedSeries[]>(() => {
        return preparedSeries.map((singleSeries) => {
            if (singleSeries.legend.enabled) {
                return {
                    ...singleSeries,
                    visible: activeLegendItems.includes(singleSeries.name),
                };
            }

            return singleSeries;
        });
    }, [preparedSeries, activeLegendItems]);

    // FIXME: remove effect. It initiates extra rerender
    React.useEffect(() => {
        setActiveLegendItems(getActiveLegendItems(preparedSeries));
    }, [preparedSeries]);

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
                nextActiveLegendItems = getAllLegendItems(preparedSeries);
            } else {
                nextActiveLegendItems = [name];
            }

            setActiveLegendItems(nextActiveLegendItems);
        },
        [preparedSeries, activeLegendItems],
    );

    return {preparedSeries: chartSeries, handleLegendItemClick};
};
