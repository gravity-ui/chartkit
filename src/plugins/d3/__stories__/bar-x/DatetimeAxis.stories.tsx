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
        title: {text: 'DateTime axis'},
        xAxis: {
            type: 'datetime',
            labels: {enabled: true},
        },
        legend: {enabled: true},
        tooltip: {enabled: true},
        yAxis: [
            {
                type: 'linear',
                labels: {enabled: true},
                lineColor: 'transparent',
                min: 0,
            },
        ],
        series: {
            data: [
                {
                    type: 'bar-x',
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
                    type: 'bar-x',
                    visible: true,
                    data: [
                        {
                            x: Number(new Date(2022, 11, 25)),
                            y: 120,
                        },
                    ],
                    name: 'C',
                },
            ],
        },
    };

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ChartKit ref={chartkitRef} type="d3" data={object<ChartKitWidgetData>('data', data)} />
        </div>
    );
};

export const DatetimeXAxis = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Bar-X',
    decorators: [withKnobs],
};

export default meta;
