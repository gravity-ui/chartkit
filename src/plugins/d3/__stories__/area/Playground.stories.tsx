import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitWidgetData} from '../../../../types';
import {HighchartsPlugin} from '../../../highcharts';

function prepareData(): ChartKitWidgetData {
    return {
        series: {
            options: {
                line: {
                    lineWidth: 2,
                },
            },
            data: [
                {
                    name: 'A',
                    type: 'area',
                    data: [
                        {x: 1, y: 200},
                        {x: 2, y: 220},
                        {x: 3, y: 180},
                    ],
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                    },
                },
                {
                    name: 'B',
                    type: 'area',
                    data: [
                        {x: 1, y: 30},
                        {x: 2, y: 25},
                        {x: 3, y: 45},
                    ],
                    stacking: 'normal',
                    dataLabels: {
                        enabled: true,
                    },
                },
            ],
        },
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
        settings.set({plugins: [D3Plugin, HighchartsPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <>
            <div
                style={{
                    height: '80vh',
                    width: '100%',
                }}
            >
                <ChartKit type="d3" data={data} />
            </div>
        </>
    );
};

export const PlaygroundLineChartStory: StoryObj<typeof ChartStory> = {
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
    title: 'Plugins/D3/Area',
    component: ChartStory,
};
