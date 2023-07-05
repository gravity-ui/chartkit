import {Meta, Story} from '@storybook/react';
import React from 'react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/complex';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/TwoAxis',
    component: ChartKit,
} as Meta;

const Template: Story = () => {
    return <ChartStory data={data} height="500px" />;
};

export const TwoAxis = Template.bind({});
