import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../components/ChartKit';
import {data} from '../mocks/unsafe-tooltip';

import {ChartStory} from './components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/UnsafeTooltip',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const UnsafeTooltip: Story = {
    render: () => <ChartStory data={data} />,
};
