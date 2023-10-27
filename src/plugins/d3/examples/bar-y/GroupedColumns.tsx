import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {BarYSeries, ChartKitWidgetData} from '../../../../types';
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
                    y: String(year),
                    x: list.length,
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
            type: 'bar-y',
            name: s.name,
            data: s.data,
        } as BarYSeries;
    });

    const widgetData: ChartKitWidgetData = {
        series: {
            data: data,
        },
        yAxis: [
            {
                type: 'category',
                categories: categories.slice(0, 5).sort(),
                title: {
                    text: 'Release year',
                },
            },
        ],
    };

    return <ChartKit type="d3" data={widgetData} />;
};
