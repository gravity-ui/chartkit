import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';
import {groups} from 'd3';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitWidgetData} from '../../../../types';
import nintendoGames from '../../examples/nintendoGames';

function prepareData(): ChartKitWidgetData {
    const gamesByPlatform = groups(nintendoGames, (item) => item['platform']);
    const data = gamesByPlatform.map(([value, games]) => ({
        x: games.length,
        y: value,
    }));

    return {
        series: {
            data: [
                {
                    type: 'bar-y',
                    data,
                    name: 'Games released',
                    dataLabels: {
                        enabled: true,
                    },
                },
            ],
        },
        xAxis: {
            title: {text: 'Number of games released'},
            labels: {
                enabled: true,
            },
            lineColor: 'transparent',
        },
        yAxis: [
            {
                type: 'category',
                categories: gamesByPlatform.map(([key]) => key),
                title: {
                    text: 'Game Platforms',
                },
                labels: {
                    enabled: true,
                },
                ticks: {
                    pixelInterval: 120,
                },
            },
        ],
        chart: {
            events: {
                click: action('chart.events.click'),
            },
        },
    };
}

const ChartStory = ({data}: {data: ChartKitWidgetData}) => {
    const [shown, setShown] = React.useState(false);

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: '80vh',
                width: '100%',
            }}
        >
            <ChartKit type="d3" data={data} />
        </div>
    );
};

export const PlaygroundBarYChartStory: StoryObj<typeof ChartStory> = {
    name: 'Playground',
    args: {
        data: prepareData(),
    },
    argTypes: {
        data: {
            control: 'object',
        },
    },
};

export default {
    title: 'Plugins/D3/Bar-Y',
    component: ChartStory,
};
