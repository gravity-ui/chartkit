import React from 'react';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, ScatterSeries} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

function prepareData() {
    const dataset = nintendoGames.filter((d) => d.date && d.user_score);
    const data = dataset.map((d) => ({
        x: d.date || undefined,
        y: d.user_score || undefined,
        custom: d,
    }));

    return {
        series: [
            {
                data,
                name: 'Nintendo games',
            },
        ],
    };
}

export const Basic = () => {
    const {series} = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series.map<ScatterSeries>((s) => ({
                type: 'scatter',
                data: s.data.filter((d) => d.x),
                name: s.name,
            })),
        },
        yAxis: [
            {
                title: {
                    text: 'User score',
                },
            },
        ],
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Release dates',
            },
        },
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
