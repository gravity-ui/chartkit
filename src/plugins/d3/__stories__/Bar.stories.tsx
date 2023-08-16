import React from 'react';
import {Meta, Story} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../libs';
import {ChartKit} from '../../../components/ChartKit';
import type {ChartKitRef} from '../../../types';
import type {ChartKitWidgetData} from '../../../types/widget-data';
import {D3Plugin} from '..';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const chartBaseOptions = {
        legend: {enabled: true},
        tooltip: {enabled: false},
        yAxis: [
            {
                type: 'linear',
                labels: {enabled: true},
                min: 0,
            },
        ],
        series: {
            data: [
                {
                    type: 'bar',
                    visible: true,
                    data: [
                        {
                            category: 'A',
                            x: 10,
                            y: 100,
                        },
                        {
                            category: 'B',
                            x: 12,
                            y: 80,
                        },
                    ],
                    name: 'AB',
                },
                {
                    type: 'bar',
                    visible: true,
                    data: [
                        {
                            category: 'C',
                            x: 95.5,
                            y: 120,
                        },
                    ],
                    name: 'C',
                    color: 'salmon',
                },
            ],
        },
    };

    const categoryXAxis = {
        ...chartBaseOptions,
        title: {text: 'Category axis'},
        xAxis: {
            type: 'category',
            categories: ['A', 'B', 'C'],
            labels: {enabled: true},
        },
    } as ChartKitWidgetData;

    const linearXAxis = {
        ...chartBaseOptions,
        title: {text: 'Linear axis'},
        xAxis: {
            type: 'linear',
            labels: {enabled: true},
        },
    } as ChartKitWidgetData;

    const dateTimeXAxis = {
        ...chartBaseOptions,
        title: {text: 'DateTime axis'},
        xAxis: {
            type: 'datetime',
            labels: {enabled: true},
        },
        series: {
            data: [
                {
                    type: 'bar',
                    visible: true,
                    data: [
                        {
                            x: Number(new Date(2022, 10, 10)),
                            y: 100,
                        },
                        {
                            x: Number(new Date(2023, 2, 5)),
                            y: 80,
                        },
                    ],
                    name: 'AB',
                },
                {
                    type: 'bar',
                    visible: true,
                    data: [
                        {
                            x: Number(new Date(2022, 11, 25)),
                            y: 120,
                        },
                    ],
                    name: 'C',
                    color: 'salmon',
                },
            ],
        },
    } as ChartKitWidgetData;

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: '80vh',
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '50% auto',
                gridColumnGap: '20px',
            }}
        >
            <div>
                <ChartKit ref={chartkitRef} type="d3" data={categoryXAxis} />
            </div>
            <div>
                <ChartKit ref={chartkitRef} type="d3" data={linearXAxis} />
            </div>
            <div>
                <ChartKit ref={chartkitRef} type="d3" data={dateTimeXAxis} />
            </div>
        </div>
    );
};

export const Bar = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3',
    decorators: [withKnobs],
};

export default meta;
