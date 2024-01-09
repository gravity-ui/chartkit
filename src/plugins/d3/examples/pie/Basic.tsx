import React from 'react';
import {groups} from 'd3';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

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

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
