import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitWidgetData} from '../../../../types';
import nintendoGames from '../../examples/nintendoGames';

function prepareData() {
    const dataset = nintendoGames.filter((d) => d.date && d.user_score);
    const data = dataset.map((d) => ({
        x: d.date || undefined,
        y: d.user_score || undefined,
        custom: d,
    }));

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'scatter',
                    data,
                    name: 'Scatter series',
                },
            ],
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
        chart: {
            events: {
                click: action('chart.events.click'),
            },
        },
    };

    return widgetData;
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
    title: 'Plugins/D3/Scatter',
    component: ChartStory,
};
