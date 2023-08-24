import React from 'react';
import get from 'lodash/get';

import type {ChartKitWidgetSeries} from '../../../../../types/widget-data';

import {isAxisRelatedSeries} from '../../utils';

export type OnLegendItemClick = (data: {name: string; metaKey: boolean}) => void;

type Args = {
    series: ChartKitWidgetSeries[];
};

const getActiveLegendItems = (series: ChartKitWidgetSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        const isAxisRelated = isAxisRelatedSeries(s);
        const isLegendEnabled = get(s, 'legend.enabled', true);
        const isSeriesVisible = get(s, 'visible', true);

        if (isLegendEnabled && isAxisRelated && isSeriesVisible && 'name' in s) {
            acc.push(s.name);
        } else if (isLegendEnabled && !isAxisRelated) {
            s.data.forEach((d) => {
                const isDataVisible = get(d, 'visible', true);

                if (isDataVisible && 'name' in d) {
                    acc.push(d.name);
                }
            });
        }

        return acc;
    }, []);
};

const getAllLegendItems = (series: ChartKitWidgetSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        if (isAxisRelatedSeries(s) && 'name' in s) {
            acc.push(s.name);
        } else {
            acc.push(...s.data.map((d) => ('name' in d && d.name) || ''));
        }

        return acc;
    }, []);
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
