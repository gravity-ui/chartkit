import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/pie-with-totals';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Pie',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTotals: Story = {
    render: () => <ChartStory data={data} />,
};
