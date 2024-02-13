import React from 'react';

import {Meta, Story} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import type {HighchartsWidgetData} from '../../types';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
} as Meta;

const data = {
    data: {
        graphs: [
            {
                data: [
                    29.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4,
                ],
            },
        ],
    },
    config: {
        hideHolidaysBands: true,
    },
    libraryConfig: {
        chart: {
            type: 'area',
        },
        plotOptions: {
            series: {
                threshold: 100,
            },
        },
        xAxis: {
            categories: [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ],
        },
    },
} as HighchartsWidgetData;

const Template: Story<any> = () => {
    return <ChartStory data={data} height="300px" />;
};

export const WithThreshold = Template.bind({});
