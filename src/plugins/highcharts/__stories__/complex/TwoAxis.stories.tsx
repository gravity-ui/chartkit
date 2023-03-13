import React from 'react';
import {Meta, Story} from '@storybook/react';
import {ChartKit} from '../../../../components/ChartKit';
import {ChartStory} from '../components/ChartStory';
import {data} from '../../mocks/complex';

export default {
    title: 'Plugins/Highcharts/TwoAxis',
    component: ChartKit,
} as Meta;

const Template: Story = () => {
    return <ChartStory data={data} height="500px" />;
};

export const TwoAxis = Template.bind({});
