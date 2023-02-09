import React from 'react';
import {Story, Meta} from '@storybook/react';
import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../mocks/combo-chart-with-same-legend-titles';
import {ChartStory} from '../components/ChartStory';
export default {
    title: 'Plugins/Highcharts/Combined Charts',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory height={500} data={data} />;
};

export const ComboChart = Template.bind({});
