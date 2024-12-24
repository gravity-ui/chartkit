import React from 'react';

import {Meta, Story} from '@storybook/react';
import Highcharts from 'highcharts';
import venn from 'highcharts/modules/venn';

import {ChartKit} from '../../../components/ChartKit';
import {data} from '../mocks/venn';

import {ChartStory} from './components/ChartStory';

export default {
    title: 'Plugins/Highcharts/Venn',
    component: ChartKit,
} as Meta;

venn(Highcharts);

const Template: Story<any> = () => {
    return <ChartStory data={data} />;
};

export const UnsafeTooltip = Template.bind({});
