import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/complex';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/TwoAxis',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoAxis: Story = {
    render: () => <ChartStory data={data} height="500px" />,
};
