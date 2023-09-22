import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {BarXSeries, ChartKitWidgetData} from '../../../../types';
import nintendoGames from '../nintendoGames';
import {groups} from 'd3';

function prepareData() {
    const grouped = groups(
        nintendoGames,
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
            data: data,
        },
        xAxis: {
            type: 'category',
            categories: categories.sort(),
            title: {
                text: 'Release year',
            },
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};
