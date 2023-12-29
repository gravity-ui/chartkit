import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import nintendoGames from '../nintendoGames';
import {groups} from 'd3';

function prepareData() {
    const gamesByPlatform = groups(nintendoGames, (d) => d.esrb_rating || 'unknown');
    return gamesByPlatform.map(([value, games]) => ({
        name: value,
        value: games.length,
    }));
}

export const Donut = () => {
    const data = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'pie',
                    innerRadius: '50%',
                    data: data,
                    center: {
                        text: `All: ${data.reduce((sum, d) => sum + d.value, 0)}`,
                    },
                },
            ],
        },
        legend: {enabled: true},
        title: {
            text: 'ESRB ratings',
            style: {fontSize: '12px', fontWeight: 'normal'},
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};
