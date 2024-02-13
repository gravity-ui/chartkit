import React from 'react';

import {groups} from 'd3';

import {ChartKit} from '../../../../components/ChartKit';
import type {BarYSeries, BarYSeriesData, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

function prepareData(field: 'platform' | 'meta_score' | 'date' = 'platform') {
    const gamesByPlatform = groups(nintendoGames, (item) => item[field]);
    const data = gamesByPlatform.map(([value, games]) => ({
        y: value,
        x: games.length,
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

export const Basic = () => {
    const {categories, series} = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series.map<BarYSeries>((s) => ({
                type: 'bar-y',
                data: s.data as BarYSeriesData[],
                name: s.name,
            })),
        },
        xAxis: {title: {text: 'Number of games released'}},
        yAxis: [
            {
                type: 'category',
                categories: categories.map(String),
                title: {
                    text: 'Game Platforms',
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
