import React from 'react';
import {groups} from 'd3';
import {ChartKit} from '../../../../components/ChartKit';
import type {BarYSeries, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

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

export const PercentStackingBars = () => {
    const {series, categories} = prepareData();
    const data = series.map((s) => {
        return {
            type: 'bar-y',
            stacking: 'percent',
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
                categories: categories.sort(),
                title: {
                    text: 'Release year',
                },
            },
        ],
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
