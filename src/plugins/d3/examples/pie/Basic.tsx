import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import nintendoGames from '../nintendoGames';
import {groups} from 'd3';

function prepareData() {
    const gamesByPlatform = groups(nintendoGames, (item) => item.platform);
    return gamesByPlatform.map(([platform, games]) => ({
        name: platform,
        value: games.length,
    }));
}

export const BasicPie = () => {
    const data = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'pie',
                    data: data,
                },
            ],
        },
        legend: {enabled: true},
        title: {
            text: 'Platforms',
            style: {fontSize: '12px', fontWeight: 'normal'},
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};
