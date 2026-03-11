import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/column-hor-stacked';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Column',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const HorizontalStacked: Story = {
    render: () => <ChartStory data={data} />,
};
