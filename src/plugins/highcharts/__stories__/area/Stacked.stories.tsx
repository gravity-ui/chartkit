import {Meta, Story} from '@storybook/react';
import React from 'react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/area-stacked';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory data={data} height="500px" />;
};

export const AreaStacked = Template.bind({});
