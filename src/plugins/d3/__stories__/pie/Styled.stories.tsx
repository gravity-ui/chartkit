import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {object, withKnobs} from '@storybook/addon-knobs';
import {Meta, Story} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import type {ChartKitRef, ChartKitWidgetData} from '../../../../types';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const data: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'pie',
                    borderRadius: 5,
                    borderWidth: 3,
                    center: ['25%', null],
                    radius: '75%',
                    dataLabels: {enabled: false},
                    data: [
                        {
                            name: 'One 1',
                            value: 50,
                        },
                        {
                            name: 'Two 1',
                            value: 20,
                        },
                        {
                            name: 'Three 1',
                            value: 90,
                        },
                    ],
                },
                {
                    type: 'pie',
                    borderRadius: 5,
                    borderWidth: 3,
                    center: ['75%', null],
                    innerRadius: '50%',
                    radius: '75%',
                    dataLabels: {enabled: false},
                    data: [
                        {
                            name: 'One 2',
                            value: 50,
                        },
                        {
                            name: 'Two 2',
                            value: 20,
                        },
                        {
                            name: 'Three 2',
                            value: 90,
                        },
                    ],
                },
            ],
        },
        title: {text: 'Styled pies'},
        legend: {enabled: false},
        tooltip: {enabled: true},
    };

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: '300px',
                width: '100%',
            }}
        >
            <ChartKit ref={chartkitRef} type="d3" data={object<ChartKitWidgetData>('data', data)} />
        </div>
    );
};

export const Styled = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Pie',
    decorators: [withKnobs],
};

export default meta;
