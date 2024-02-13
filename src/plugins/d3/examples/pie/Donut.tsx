import React from 'react';

import {groups} from 'd3';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

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
                },
            ],
        },
        legend: {enabled: true},
        title: {
            text: 'ESRB ratings',
            style: {fontSize: '12px', fontWeight: 'normal'},
        },
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
