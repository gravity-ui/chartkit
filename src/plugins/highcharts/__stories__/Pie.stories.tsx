import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../components/ChartKit';
import {data} from '../mocks/pie';

import {ChartStory} from './components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Pie',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Pie: Story = {
    render: () => <ChartStory data={data} />,
};
