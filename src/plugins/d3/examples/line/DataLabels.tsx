import React from 'react';
import {dateTime} from '@gravity-ui/date-utils';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, LineSeries, LineSeriesData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import nintendoGames from '../nintendoGames';

function prepareData(): LineSeries[] {
    const games = nintendoGames.filter((d) => {
        return d.date && d.user_score;
    });

    const byGenre = (genre: string) => {
        return games
            .filter((d) => d.genres.includes(genre))
            .map((d) => {
                return {
                    x: d.date,
                    y: d.user_score,
                    label: `${d.title} (${d.user_score})`,
                    custom: d,
                };
            }) as LineSeriesData[];
    };

    return [
        {
            name: 'Strategy',
            type: 'line',
            data: byGenre('Strategy'),
            dataLabels: {
                enabled: true,
            },
        },
        {
            name: 'Shooter',
            type: 'line',
            data: byGenre('Shooter'),
            dataLabels: {
                enabled: true,
            },
        },
    ];
}

export const DataLabels = () => {
    const series = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series.map<LineSeries>((s) => ({
                type: 'line',
                data: s.data.filter((d) => d.x),
                name: s.name,
                dataLabels: {
                    enabled: true,
                },
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
            ticks: {pixelInterval: 200},
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
