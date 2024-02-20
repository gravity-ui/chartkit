import React from 'react';
import {StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {D3Plugin} from '../..';
import {ChartKitWidgetData} from '../../../../types';
import {ChartKit} from '../../../../components/ChartKit';
import {groups} from 'd3';
import nintendoGames from '../../examples/nintendoGames';

function prepareData(): ChartKitWidgetData {
    const gamesByPlatform = groups(nintendoGames, (item) => item['platform']);
    const data = gamesByPlatform.map(([value, games]) => ({
        x: value,
        y: games.length,
    }));

    return {
        series: {
            data: [
                {
                    type: 'bar-x',
                    data,
                    name: 'Games released',
                },
            ],
        },
        xAxis: {
            type: 'category',
            categories: gamesByPlatform.map(([key, _group]) => key),
            title: {
                text: 'Game Platforms',
            },
            labels: {
                enabled: true,
                rotation: 30,
            },
        },
        yAxis: [
            {
                title: {text: 'Number of games released'},
                labels: {
                    enabled: true,
                    rotation: -90,
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

export const PlaygroundBarXChartStory: StoryObj<typeof ChartStory> = {
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
    title: 'Plugins/D3/Bar-X',
    component: ChartStory,
};
