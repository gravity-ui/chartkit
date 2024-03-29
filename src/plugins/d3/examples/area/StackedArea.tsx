import React from 'react';

import {groups} from 'd3';

import {ChartKit} from '../../../../components/ChartKit';
import type {AreaSeries, AreaSeriesData, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

const years = Array.from(
    new Set(
        nintendoGames.map((d) =>
            d.date ? String(new Date(d.date as number).getFullYear()) : 'unknown',
        ),
    ),
).sort();

function prepareData() {
    const grouped = groups(
        nintendoGames,
        (d) => d.platform,
        (d) => (d.date ? String(new Date(d.date as number).getFullYear()) : 'unknown'),
    );
    const series = grouped.map(([platform, gamesByYear]) => {
        const platformGames = Object.fromEntries(gamesByYear) || {};
        return {
            name: platform,
            data: years.reduce<AreaSeriesData[]>((acc, year) => {
                if (year in platformGames) {
                    acc.push({
                        x: year,
                        y: platformGames[year].length,
                    });
                }

                return acc;
            }, []),
        };
    });

    return {series};
}

export const StackedArea = () => {
    const {series} = prepareData();

    const data = series.map((s) => {
        return {
            type: 'area',
            stacking: 'normal',
            name: s.name,
            data: s.data,
        } as AreaSeries;
    });

    const widgetData: ChartKitWidgetData = {
        series: {
            data: data,
        },
        xAxis: {
            type: 'category',
            categories: years,
        },
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
