import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, AreaSeries, AreaSeriesData} from '../../../../types';
import nintendoGames from '../nintendoGames';

function prepareData(): AreaSeries[] {
    const games = nintendoGames.filter((d) => {
        return d.date && d.user_score && d.genres.includes('Puzzle');
    });

    return [
        {
            name: 'User score',
            type: 'area',
            data: games.map<AreaSeriesData>((d) => {
                return {
                    x: Number(d.date),
                    y: Number(d.user_score),
                };
            }),
        },
    ];
}

export const Basic = () => {
    const series = prepareData();

    const widgetData: ChartKitWidgetData = {
        title: {
            text: 'User score (puzzle genre)',
        },
        series: {
            data: series,
        },
        xAxis: {
            type: 'datetime',
        },
    };

    return <ChartKit type="d3" data={widgetData} />;
};
