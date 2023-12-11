import React from 'react';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, AreaSeries, AreaSeriesData} from '../../../../types';
import nintendoGames from '../nintendoGames';
import {dateTime} from '@gravity-ui/date-utils';

function prepareData(): AreaSeries[] {
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
            }) as AreaSeriesData[];
    };

    return [
        {
            name: 'Strategy',
            type: 'area',
            data: byGenre('Strategy'),
        },
        {
            name: 'Shooter',
            type: 'area',
            data: byGenre('Shooter'),
        },
    ];
}

export const Basic = () => {
    const series = prepareData();

    const widgetData: ChartKitWidgetData = {
        series: {
            data: series,
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
                const point = d.hovered[0]?.data as AreaSeriesData;

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

    return <ChartKit type="d3" data={widgetData} />;
};
