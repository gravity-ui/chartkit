import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import type {HighchartsWidgetData} from '../../types';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Area',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

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

export const WithThreshold: Story = {
    render: () => <ChartStory data={data} height="300px" />,
};
