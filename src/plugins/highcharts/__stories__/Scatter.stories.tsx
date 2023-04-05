import React from 'react';
import {Meta, Story} from '@storybook/react';
import {withKnobs, boolean} from '@storybook/addon-knobs';
import cloneDeep from 'lodash/cloneDeep';
import {ChartKit} from '../../../components/ChartKit';
import {data} from '../mocks/scatter';
import {ChartStory} from './components/ChartStory';

export default {
    title: 'Plugins/Highcharts/config',
    component: ChartKit,
    decorators: [withKnobs],
} as Meta;

const Template: Story<any> = () => {
    const clonedData = cloneDeep(data);
    clonedData.config.unsafe = boolean('unsafe', false);
    return <ChartStory data={clonedData} />;
};

export const Unsafe = Template.bind({});
