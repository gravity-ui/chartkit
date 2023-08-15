import React from 'react';
import {Meta, Story} from '@storybook/react';
import {withKnobs, object} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../libs';
import {ChartKit} from '../../../components/ChartKit';
import type {ChartKitRef} from '../../../types';
import type {ChartKitWidgetData} from '../../../types/widget-data';
import {D3Plugin} from '..';
import penguins from './penguins.json';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const seriesData = penguins.map((item) => {
        return {
            category: item.island,
            x: item.culmen_length_mm || 0,
            y: item.body_mass_g || 0,
        };
    });
    const categories = Array.from(new Set(penguins.map((item) => item.island)));
    const data: ChartKitWidgetData = {
        title: {text: 'Bar chart'},
        xAxis: {
            type: 'category',
            categories: categories,
            labels: {enabled: true},
        },
        yAxis: [
            {
                type: 'linear',
                labels: {enabled: true},
            },
        ],
        series: [
            {
                type: 'bar',
                visible: true,
                data: seriesData.filter((item) => item.category === categories[0]),
                name: 'First',
            },
            {
                type: 'bar',
                visible: true,
                data: seriesData.filter((item) => item.category !== categories[0]),
                name: 'Second',
                color: 'salmon',
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
        <div style={{height: '80vh', width: '100%'}}>
            <ChartKit ref={chartkitRef} type="d3" data={object('chart data', data)} />
        </div>
    );
};

export const Bar = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3',
    decorators: [withKnobs],
};

export default meta;
