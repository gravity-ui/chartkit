import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, LineSeries, LineSeriesData} from '../../../../types';
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
            data: series.map<LineSeries>((s) => ({
                type: 'line',
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
        tooltip: {
            renderer: (d) => {
                const point = d.hovered[0]?.data as LineSeriesData;

                if (!point) {
                    return null;
                }

                const title = point.custom.title;
                const score = point.custom.user_score;
                const date = dateTime({input: point.custom.date}).format('DD MMM YYYY');

                return (
                    <React.Fragment>
                        <b>{title}</b>
                        <br />
                        Release date: {date}
                        <br />
                        User score: {score}
                    </React.Fragment>
                );
            },
        },
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
