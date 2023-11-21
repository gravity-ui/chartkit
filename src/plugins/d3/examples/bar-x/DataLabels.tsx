import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {BarXSeries, BarXSeriesData, ChartKitWidgetData} from '../../../../types';
import nintendoGames from '../nintendoGames';
import {groups, sort} from 'd3';

const years = Array.from(
    new Set(
        nintendoGames.map((g) =>
            g.date ? new Date(g.date as number).getFullYear().toString() : 'unknown',
        ),
    ),
);

function prepareData(): BarXSeries[] {
    const games = sort(
        nintendoGames.filter((d) => {
            return d.date && d.user_score;
        }),
        (d) => d.date,
    );

    const groupByYear = (d: any) => (d.date ? new Date(d.date as number).getFullYear() : 'unknown');

    const byGenre = (genre: string): BarXSeries => {
        const data = groups(
            games.filter((d) => d.genres.includes(genre)),
            groupByYear,
        ).map<BarXSeriesData>(([year, items]) => {
            return {
                x: years.indexOf(String(year)),
                y: items.length,
            };
        });

        return {
            type: 'bar-x',
            name: genre,
            dataLabels: {
                enabled: true,
            },
            stacking: 'normal',
            data,
        };
    };

    return [byGenre('Strategy'), byGenre('Shooter'), byGenre('Puzzle'), byGenre('Action')];
}

export const DataLabels = () => {
    const series = prepareData();
    const widgetData: ChartKitWidgetData = {
        series: {
            data: series,
        },
        xAxis: {
            categories: years,
            type: 'category',
            title: {
                text: 'Release year',
            },
            ticks: {pixelInterval: 200},
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};
