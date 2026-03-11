import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';
import Highcharts from 'highcharts';
import venn from 'highcharts/modules/venn';

import {ChartKit} from '../../../components/ChartKit';
import {data} from '../mocks/venn';

import {ChartStory} from './components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Venn',
    component: ChartKit,
};

export default meta;

venn(Highcharts);

type Story = StoryObj<typeof meta>;

export const Venn: Story = {
    render: () => <ChartStory data={data} />,
};
