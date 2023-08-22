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
                    type: 'pie',
                    data: [
                        {
                            name: 'One',
                            value: 50,
                        },
                        {
                            name: 'Two',
                            value: 20,
                        },
                        {
                            name: 'Three',
                            value: 90,
                        },
                    ],
                },
            ],
        },
        title: {text: 'Basic pie'},
        legend: {enabled: false},
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

export const BasicPie = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Pie',
    decorators: [withKnobs],
};

export default meta;
