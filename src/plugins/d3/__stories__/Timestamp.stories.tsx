import React from 'react';
import random from 'lodash/random';
import {Meta, Story} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../libs';
import {ChartKit} from '../../../components/ChartKit';
import type {ChartKitRef} from '../../../types';
import type {
    ChartKitWidgetData,
    ScatterSeries,
    ScatterSeriesData,
} from '../../../types/widget-data';
import {D3Plugin} from '..';

const rowData = [
    {
        x: 1690686000000,
        y: 86.71905594602345,
    },
    {
        x: 1690426800000,
        y: 86.73089353359981,
    },
    {
        x: 1690254000000,
        y: 86.53675705168267,
    },
    {
        x: 1690772400000,
        y: 86.47880981408552,
    },
    {
        x: 1690340400000,
        y: 86.4108836764148,
    },
    {
        x: 1690599600000,
        y: 86.73440096266042,
    },
    {
        x: 1690513200000,
        y: 86.64935929597681,
    },
];

const shapeData = (data: Record<string, any>[]): ChartKitWidgetData => {
    const scatterData: ScatterSeriesData[] = data.map((d) => ({
        x: d.x,
        y: d.y,
        radius: random(3, 6),
    }));

    const scatterSeries: ScatterSeries = {
        type: 'scatter',
        data: scatterData,
        name: 'some-name',
    };

    return {
        series: [scatterSeries],
        xAxis: {
            type: 'datetime',
            timestamps: data.map((d) => d.x),
        },
    };
};

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const data = shapeData(rowData);

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ChartKit ref={chartkitRef} type="d3" data={data} />
        </div>
    );
};

export const Timestamp = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3',
};

export default meta;
