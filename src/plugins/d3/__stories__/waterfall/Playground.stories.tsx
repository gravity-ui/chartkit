import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitWidgetData} from '../../../../types';

function prepareData() {
    const result: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'waterfall',
                    data: [
                        {y: 100, x: 0},
                        {y: -20, x: 1},
                        {y: -15, x: 2},
                        {y: 30, x: 3},
                        {y: 45, x: 4},
                        {y: 10, x: 5},
                        {y: -120, x: 6},
                        {y: 30, x: 7},
                        {y: 10, x: 8},
                        {y: -20, x: 9},
                        {y: -5, x: 10},
                        {y: 35, x: 11},
                        {total: true, x: 12},
                    ],
                    name: 'Profit',
                    dataLabels: {enabled: true},
                },
            ],
        },
        xAxis: {
            type: 'category',
            categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
                'Totals',
            ],
            labels: {
                enabled: true,
                rotation: 30,
            },
        },
        yAxis: [
            {
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

    return result;
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

export const PlaygroundWaterfallChartStory: StoryObj<typeof ChartStory> = {
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
    title: 'Plugins/D3/Waterfall',
    component: ChartStory,
};
