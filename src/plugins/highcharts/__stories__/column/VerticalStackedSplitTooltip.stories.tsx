import React from 'react';

import {Meta, Story} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/column-ver-stacked';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/Column',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory data={data} splitTooltip />;
};

export const VerticalStackedSplitTooltip = Template.bind({});
