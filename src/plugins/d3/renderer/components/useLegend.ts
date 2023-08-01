import React from 'react';

import type {ChartKitWidgetSeries} from '../../../../types/widget-data';

import {getVisibleSeriesNames} from './utils';

export type OnLegendItemClick = (data: {name: string; metaKey: boolean}) => void;

type Args = {
    series: ChartKitWidgetSeries[];
};

export const useLegend = (args: Args) => {
    const {series} = args;
    const [activeLegendItems, setActiveLegendItems] = React.useState(getVisibleSeriesNames(series));

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
                nextActiveLegendItems = getVisibleSeriesNames(series);
            } else {
                nextActiveLegendItems = [name];
            }

            setActiveLegendItems(nextActiveLegendItems);
        },
        [series, activeLegendItems],
    );

    // FIXME: remove effect. It initiates extra rerender
    React.useEffect(() => {
        setActiveLegendItems(getVisibleSeriesNames(series));
    }, [series]);

    return {activeLegendItems, handleLegendItemClick};
};
