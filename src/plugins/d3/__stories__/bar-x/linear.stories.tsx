import React from 'react';
import {Meta, Story} from '@storybook/react';
import {withKnobs, object} from '@storybook/addon-knobs';
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
        series: {
            data: [
                {
                    type: 'bar-x',
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
                    type: 'bar-x',
                    visible: true,
                    data: [
                        {
                            category: 'C',
                            x: 95.5,
                            y: 120,
                        },
                    ],
                    name: 'C',
                },
            ],
        },
        title: {text: 'Linear axis'},
        xAxis: {
            type: 'linear',
            labels: {enabled: true},
        },
        yAxis: [
            {
                type: 'linear',
                labels: {enabled: true},
                min: 0,
                ticks: {
                    pixelInterval: 100,
                },
            },
        ],
        legend: {enabled: true},
        tooltip: {enabled: false},
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

export const LinearXAxis = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Bar-X',
    decorators: [withKnobs],
};

export default meta;
