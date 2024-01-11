import React from 'react';
import {group, scaleOrdinal} from 'd3';

import type {ChartKitWidgetData} from '../../../../../types';

import {DEFAULT_PALETTE} from '../../constants';
import {getSeriesNames} from '../../utils';
import type {PreparedAxis, PreparedChart} from '../useChartOptions/types';
import {getActiveLegendItems, getAllLegendItems} from './utils';
import type {PreparedSeries, OnLegendItemClick} from './types';
import {getPreparedLegend, getLegendComponents} from './prepare-legend';
import {getPreparedOptions} from './prepare-options';
import {prepareSeries} from './prepareSeries';

type Args = {
    chartWidth: number;
    chartHeight: number;
    chartMargin: PreparedChart['margin'];
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series'];
    preparedYAxis: PreparedAxis[];
};

export const useSeries = (args: Args) => {
    const {
        chartWidth,
        chartHeight,
        chartMargin,
        legend,
        preparedYAxis,
        series: {data: series, options: seriesOptions},
    } = args;
    const preparedLegend = React.useMemo(
        () => getPreparedLegend({legend, series}),
        [legend, series],
    );
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
                        seriesOptions,
                        legend: preparedLegend,
                        colorScale,
                    }),
                );
                return acc;
            },
            [],
        );
    }, [series, seriesOptions, preparedLegend]);
    const preparedSeriesOptions = React.useMemo(() => {
        return getPreparedOptions(seriesOptions);
    }, [seriesOptions]);
    const [activeLegendItems, setActiveLegendItems] = React.useState(
        getActiveLegendItems(preparedSeries),
    );
    const chartSeries = React.useMemo<PreparedSeries[]>(() => {
        return preparedSeries.map((singleSeries, i) => {
            singleSeries.id = `Series ${i + 1}`;

            if (singleSeries.legend.enabled) {
                return {
                    ...singleSeries,
                    visible: activeLegendItems.includes(singleSeries.name),
                };
            }

            return singleSeries;
        });
    }, [preparedSeries, activeLegendItems]);
    const {legendConfig, legendItems} = React.useMemo(() => {
        return getLegendComponents({
            chartHeight,
            chartMargin,
            chartWidth,
            series: chartSeries,
            preparedLegend,
            preparedYAxis,
        });
    }, [chartWidth, chartHeight, chartMargin, chartSeries, preparedLegend, preparedYAxis]);

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

    // FIXME: remove effect. It initiates extra rerender
    React.useEffect(() => {
        setActiveLegendItems(getActiveLegendItems(preparedSeries));
    }, [preparedSeries]);

    return {
        legendItems,
        legendConfig,
        preparedLegend,
        preparedSeries: chartSeries,
        preparedSeriesOptions,
        handleLegendItemClick,
    };
};
