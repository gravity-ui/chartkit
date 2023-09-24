import React from 'react';
import range from 'lodash/range';
import random from 'lodash/random';
import {Meta, Story} from '@storybook/react';
import {boolean, number, select} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import {randomString} from '../../../../utils';
import type {ChartKitRef} from '../../../../types';
import type {ChartKitWidgetData, ScatterSeries} from '../../../../types/widget-data';
import {D3Plugin} from '../..';

const TEMPLATE_STRING = '0123456789abcdefghijklmnopqrstuvwxyz';

const generateSeriesData = (seriesCount = 5): ScatterSeries[] => {
    return range(0, seriesCount).map(() => {
        return {
            type: 'scatter',
            data: [
                {
                    x: random(0, 1000),
                    y: random(0, 1000),
                },
            ],
            name: `${randomString(random(3, 15), TEMPLATE_STRING)}`,
        };
    });
};

const shapeData = (): ChartKitWidgetData => {
    return {
        legend: {
            align: select('Align', ['left', 'right', 'center'], 'left', 'legend'),
            margin: number('Margin', 15, undefined, 'legend'),
            itemDistance: number('Item distance', 20, undefined, 'legend'),
        },
        series: {
            data: generateSeriesData(number('Amount of series', 1000, undefined, 'legend')),
        },
        xAxis: {
            labels: {
                enabled: boolean('Show labels', true, 'xAxis'),
            },
        },
        yAxis: [
            {
                labels: {
                    enabled: boolean('Show labels', true, 'yAxis'),
                },
            },
        ],
    };
};

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const data = shapeData();

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

export const BigLegend = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Scatter',
};

export default meta;
