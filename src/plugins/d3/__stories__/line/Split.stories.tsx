import React from 'react';

import {action} from '@storybook/addon-actions';
import type {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import type {ChartKitRef, ChartKitWidgetData, LineSeries, LineSeriesData} from '../../../../types';
import nintendoGames from '../../examples/nintendoGames';

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
            yAxis: 0,
        },
        {
            name: 'Shooter',
            type: 'line',
            data: byGenre('Shooter'),
            yAxis: 1,
        },
        {
            name: 'Puzzle',
            type: 'line',
            data: byGenre('Puzzle'),
            yAxis: 1,
        },
    ];
}

const ChartStory = () => {
    const [loading, setLoading] = React.useState(true);
    const chartkitRef = React.useRef<ChartKitRef>();

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    const widgetData: ChartKitWidgetData = {
        title: {
            text: 'Chart title',
        },
        series: {
            data: prepareData(),
        },
        split: {
            enable: true,
            layout: 'vertical',
            gap: '40px',
            plots: [{title: {text: 'Strategy'}}, {title: {text: 'Shooter & Puzzle'}}],
        },
        yAxis: [
            {
                title: {text: '1'},
                plotIndex: 0,
            },
            {
                title: {text: '2'},
                plotIndex: 1,
            },
        ],
        xAxis: {
            type: 'datetime',
        },
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div style={{height: '90vh', width: '100%'}}>
            <ChartKit
                ref={chartkitRef}
                type="d3"
                data={widgetData}
                onRender={action('onRender')}
                onLoad={action('onLoad')}
                onChartLoad={action('onChartLoad')}
            />
        </div>
    );
};

export const Split: StoryObj<typeof ChartStory> = {
    name: 'Split',
};

export default {
    title: 'Plugins/D3/Line',
    component: ChartStory,
};
