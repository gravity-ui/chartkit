import React from 'react';
import {ChartKitWidgetData} from '../../../../types';
import {ChartKit} from '../../../../components/ChartKit';
import nintendoGames from '../../examples/nintendoGames';
import {groups, max, min, median} from 'd3';

export const LineAndBarXCombinedChart = () => {
    const gamesByPlatform = groups(nintendoGames, (item) => item.platform || 'unknown');

    const widgetData: ChartKitWidgetData = {
        series: {
            options: {
                line: {
                    lineWidth: 2,
                },
            },
            data: [
                {
                    type: 'bar-x',
                    data: gamesByPlatform.map(([value, games]) => ({
                        x: value,
                        y: median(games, (g) => g.user_score || 0),
                    })),
                    name: 'Median user score',
                },
                {
                    type: 'line',
                    data: gamesByPlatform.map(([value, games]) => ({
                        x: value,
                        y: max(games, (g) => g.user_score || 0),
                    })),
                    name: 'Max user score',
                },
                {
                    type: 'line',
                    data: gamesByPlatform.map(([value, games]) => ({
                        x: value,
                        y: min(games, (g) => g.user_score || 10),
                    })),
                    name: 'Min user score',
                },
            ],
        },
        xAxis: {
            categories: gamesByPlatform.map<string>(([key]) => key),
            type: 'category',
            title: {
                text: 'Game Platforms',
            },
        },
        yAxis: [
            {
                title: {text: 'User score'},
                labels: {
                    enabled: true,
                },
                ticks: {
                    pixelInterval: 120,
                },
            },
        ],
    };

    return <ChartKit type="d3" data={widgetData} />;
};
