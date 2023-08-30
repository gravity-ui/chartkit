import React from 'react';
import {Meta, Story} from '@storybook/react';
import {object, withKnobs} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitRef} from '../../../../types';
import type {ChartKitWidgetData} from '../../../../types/widget-data';
import {D3Plugin} from '../..';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const data: ChartKitWidgetData = {
        legend: {enabled: true},
        tooltip: {enabled: true},
        title: {text: 'Category axis'},
        xAxis: {
            type: 'category',
            categories: ['A', 'B', 'C'],
            labels: {enabled: true},
        },
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
                    type: 'bar-x',
                    visible: true,
                    stacking: 'normal',
                    data: [
                        {
                            category: 'A',
                            y: 100,
                        },
                        {
                            category: 'B',
                            y: 80,
                        },
                        {
                            category: 'C',
                            y: 120,
                        },
                    ],
                    name: 'Sales',
                    dataLabels: {
                        enabled: true,
                        inside: true,
                        style: {
                            fontWeight: 'normal',
                            fontColor: '#fff',
                        },
                    },
                },
                {
                    type: 'bar-x',
                    visible: true,
                    stacking: 'normal',
                    data: [
                        {
                            category: 'A',
                            y: 5,
                        },
                        {
                            category: 'B',
                            y: 25,
                        },
                    ],
                    name: 'Discount',
                    dataLabels: {
                        enabled: true,
                    },
                },
            ],
        },
    };

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
            <ChartKit ref={chartkitRef} type="d3" data={object<ChartKitWidgetData>('data', data)} />
        </div>
    );
};

export const Stacked = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Bar-X',
    decorators: [withKnobs],
};

export default meta;
