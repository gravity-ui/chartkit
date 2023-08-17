import React from 'react';
import random from 'lodash/random';
import {Meta, Story} from '@storybook/react';
import {boolean} from '@storybook/addon-knobs';
import {dateTime} from '@gravity-ui/date-utils';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitRef} from '../../../../types';
import type {
    ChartKitWidgetData,
    ScatterSeries,
    ScatterSeriesData,
} from '../../../../types/widget-data';
import {D3Plugin} from '../..';

const rowData: ScatterSeriesData<string>[] = [
    {
        x: 1690686000000,
        y: 86.71905594602345,
        custom: 'green',
    },
    {
        x: 1690426800000,
        y: 86.73089353359981,
        custom: 'yellow',
    },
    {
        x: 1690254000000,
        y: 86.53675705168267,
        custom: 'red',
    },
    {
        x: 1690772400000,
        y: 86.47880981408552,
        custom: 'blue',
    },
    {
        x: 1690340400000,
        y: 86.4108836764148,
        custom: 'gray',
    },
    {
        x: 1690599600000,
        y: 86.73440096266042,
        custom: 'pink',
    },
    {
        x: 1690513200000,
        y: 86.64935929597681,
        custom: 'purple',
    },
];

const shapeData = (data: Record<string, any>[]): ChartKitWidgetData<string> => {
    const scatterData: ScatterSeriesData[] = data.map((d) => ({
        x: d.x,
        y: d.y,
        radius: random(3, 6),
        custom: d.custom,
    }));

    const scatterSeries: ScatterSeries = {
        type: 'scatter',
        data: scatterData,
        name: 'some-name',
    };

    return {
        series: {
            data: [scatterSeries],
        },
        xAxis: {
            type: 'datetime',
            timestamps: data.map((d) => d.x),
            grid: {
                enabled: boolean('xAxis.grid.enabled', true),
            },
            labels: {
                enabled: boolean('xAxis.labels.enabled', true),
            },
        },
        yAxis: [
            {
                grid: {
                    enabled: boolean('yAxis.grid.enabled', true),
                },
                labels: {
                    enabled: boolean('yAxis.labels.enabled', true),
                },
            },
        ],
        tooltip: {
            renderer: ({hovered}) => {
                const d = hovered.data as ScatterSeriesData<string>;
                return <div style={{color: d.custom}}>{dateTime({input: d.x}).format('LL')}</div>;
            },
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
    title: 'Plugins/D3/Scatter',
};

export default meta;
