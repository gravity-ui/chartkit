import React from 'react';

import type {ChartKitWidgetSeries, PieSeriesData} from '../../../../../types/widget-data';

import {getVisibleEntriesNames, isAxisRelatedSeries} from '../../utils';

export type OnLegendItemClick = (data: {name: string; metaKey: boolean}) => void;

type Args = {
    series: ChartKitWidgetSeries[];
};

const getActiveLegendItems = (series: ChartKitWidgetSeries[]) => {
    if (series.length === 1 && !isAxisRelatedSeries(series[0])) {
        return getVisibleEntriesNames(series[0].data as PieSeriesData[]);
    }

    return getVisibleEntriesNames(series);
};

const getAllLegendItems = (series: ChartKitWidgetSeries[]) => {
    if (series.length === 1 && !isAxisRelatedSeries(series[0])) {
        return (series[0].data as PieSeriesData[]).map((d) => d.name);
    }

    return series.map((s) => ('name' in s && s.name) || '');
};

export const useLegend = (args: Args) => {
    const {series} = args;
    const [activeLegendItems, setActiveLegendItems] = React.useState(getActiveLegendItems(series));

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

    // FIXME: remove effect. It initiates extra rerender
    React.useEffect(() => {
        setActiveLegendItems(getActiveLegendItems(series));
    }, [series]);

    return {activeLegendItems, handleLegendItemClick};
};
