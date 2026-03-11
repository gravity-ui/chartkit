import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/area-stacked';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const AreaStacked: Story = {
    render: () => <ChartStory data={data} height="500px" />,
};
