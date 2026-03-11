import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../components/ChartKit';
import {data} from '../mocks/line';

import {ChartStory} from './components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Line',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Line: Story = {
    render: () => <ChartStory data={data} />,
};
