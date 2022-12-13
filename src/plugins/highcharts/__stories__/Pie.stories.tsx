import React from 'react';
import {Meta, Story} from '@storybook/react';
import {ChartKit} from '../../../components/ChartKit';
import {data} from './mocks/pie';
import {ChartStory} from './components/ChartStory';

export default {
    title: 'Plugins/Highcharts/Pie',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory data={data} />;
};

export const Pie = Template.bind({});
