import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';
import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/area-range';
import {ChartStory} from '../components/ChartStory';

highchartsMore(Highcharts);

const meta: Meta = {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const AreaRange: Story = {
    render: () => <ChartStory data={data} />,
};
