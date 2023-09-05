import React from 'react';
import {Meta, Story} from '@storybook/react';
import {object, withKnobs} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData, ChartKitRef} from '../../../../types';
import {D3Plugin} from '../..';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const data: ChartKitWidgetData = {
        tooltip: {enabled: true},
        title: {text: 'Grouped and stacked'},
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
                            y: 805,
                        },
                        {
                            category: 'C',
                            y: 250,
                        },
                    ],
                    stackId: 'stack1',
                    name: 'Base1',
                },
                {
                    type: 'bar-x',
                    visible: true,
                    stacking: 'normal',
                    data: [
                        {
                            category: 'A',
                            y: 40,
                        },
                        {
                            category: 'B',
                            y: 80,
                        },
                        {
                            category: 'C',
                            y: 25,
                        },
                    ],
                    stackId: 'stack1',
                    name: 'Extended1',
                },
                {
                    type: 'bar-x',
                    visible: true,
                    stacking: 'normal',
                    data: [
                        {
                            category: 'A',
                            y: 110,
                        },
                        {
                            category: 'B',
                            y: 80,
                        },
                        {
                            category: 'C',
                            y: 200,
                        },
                    ],
                    stackId: 'stack2',
                    name: 'Base2',
                },
                {
                    type: 'bar-x',
                    visible: true,
                    stacking: 'normal',
                    data: [
                        {
                            category: 'A',
                            y: 110,
                        },
                        {
                            category: 'B',
                            y: 80,
                        },
                        {
                            category: 'C',
                            y: 200,
                        },
                    ],
                    stackId: 'stack2',
                    name: 'Extended2',
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

export const GroupedAndStacked = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Bar-X',
    decorators: [withKnobs],
};

export default meta;
