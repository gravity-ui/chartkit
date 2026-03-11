import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/combo-chart-with-same-legend-titles';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Combined Charts',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ComboChart: Story = {
    render: () => <ChartStory height="500px" data={data} />,
};
