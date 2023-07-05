import {Meta, Story} from '@storybook/react';
import React from 'react';

import {ChartKit} from '../../../../components/ChartKit';
import {data} from '../../mocks/area-range';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    return <ChartStory data={data} />;
};

export const AreaRange = Template.bind({});
