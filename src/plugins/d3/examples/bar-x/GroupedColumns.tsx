import React from 'react';
import {groups} from 'd3';
import {ChartKit} from '../../../../components/ChartKit';
import type {BarXSeries, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

function prepareData() {
    const displayedYears = [2015, 2016, 2017, 2018, 2019];
    const games = nintendoGames.filter((ng) =>
        displayedYears.includes(new Date(ng.date as number).getFullYear()),
    );
    const grouped = groups(
        games,
        (d) => d.platform,
        (d) => (d.date ? new Date(d.date as number).getFullYear() : 'unknown'),
    );
    const categories: string[] = [];
    const series = grouped.map(([platform, years]) => {
        return {
            name: platform,
            data: years.map(([year, list]) => {
                categories.push(String(year));

                return {
                    x: String(year),
                    y: list.length,
                };
            }),
        };
    });

    return {categories, series};
}

export const GroupedColumns = () => {
    const {series, categories} = prepareData();
    const data = series.map((s) => {
        return {
            type: 'bar-x',
            name: s.name,
            data: s.data,
        } as BarXSeries;
    });

    const widgetData: ChartKitWidgetData = {
        series: {
            data,
        },
        xAxis: {
            type: 'category',
            categories: categories.sort(),
            title: {
                text: 'Release year',
            },
        },
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
