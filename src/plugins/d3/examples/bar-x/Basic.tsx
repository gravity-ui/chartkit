import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, BarXSeries, BarXSeriesData} from '../../../../types';
import nintendoGames from '../nintendoGames';
import {groups} from 'd3';

function prepareData(field: 'platform' | 'meta_score' | 'date' = 'platform') {
    const gamesByPlatform = groups(nintendoGames, (item) => item[field]);
    const data = gamesByPlatform.map(([value, games]) => ({
        x: value,
        y: games.length,
    }));

    return {
        categories: gamesByPlatform.map(([key]) => key),
        series: [
            {
                data,
                name: 'Games released',
            },
        ],
    };
}

export const BasicBarXChart = () => {
    const {categories, series} = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series.map<BarXSeries>((s) => ({
                type: 'bar-x',
                data: s.data as BarXSeriesData[],
                name: s.name,
            })),
        },
        xAxis: {
            type: 'category',
            categories: categories.map(String),
            title: {
                text: 'Game Platforms',
            },
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};

export const BasicLinearBarXChart = () => {
    const {series} = prepareData('meta_score');

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series.map<BarXSeries>((s) => ({
                type: 'bar-x',
                data: s.data as BarXSeriesData[],
                name: s.name,
            })),
        },
        xAxis: {
            title: {
                text: 'Meta scores',
            },
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};

export const BasicDateTimeBarXChart = () => {
    const {series} = prepareData('date');

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series.map<BarXSeries>((s) => ({
                type: 'bar-x',
                data: s.data as BarXSeriesData[],
                name: s.name,
            })),
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Release date',
            },
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};
