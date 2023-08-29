import React from 'react';
import {Meta, Story} from '@storybook/react';
import Highcharts from 'highcharts';
import highchartsMore from 'highcharts/highcharts-more';
import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/area-range';
import {ChartStory} from '../components/ChartStory';

highchartsMore(Highcharts);

export default {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory data={data} />;
};

export const AreaRange = Template.bind({});
