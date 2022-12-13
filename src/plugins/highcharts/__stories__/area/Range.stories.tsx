import React from 'react';
import {Meta, Story} from '@storybook/react';
import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../mocks/area-range';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/AreaRange',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory data={data} />;
};

export const AreaRange = Template.bind({});
