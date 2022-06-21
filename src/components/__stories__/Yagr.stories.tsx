import React from 'react';
import {Meta, Story} from '@storybook/react';
import data from '../../../mocks/line10';
import {ChartKit} from '../ChartKit';

export default {
    title: 'Widgets/Yagr',
    component: ChartKit,
} as Meta;

const DefaultTemplate: Story<any> = (args) => (
    <div style={{height: 300}}>
        <ChartKit {...args} id="1" type="yagr" data={data} lang="ru" />
    </div>
);
export const Default = DefaultTemplate.bind({});
