import React from 'react';

import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import type {HighchartsWidgetData} from '../../types';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/Combined Charts',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

const data = {
    data: {
        graphs: [
            {
                data: [29.9, 40, 30.4, 50, 60, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4],
            },
            {
                type: 'area',
                data: [
                    144.0, 176.0, 135.6, 148.5, 216.4, 194.1, 95.6, 54.4, 29.9, 71.5, 106.4, 129.2,
                ],
                yAxis: 1,
            },
        ],
    },
    config: {
        hideHolidaysBands: true,
    },
    libraryConfig: {
        chart: {
            marginRight: 80,
            zoomType: 'xy',
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
            endOnTick: false,
            startOnTick: false,
        },
        yAxis: [
            {
                lineWidth: 1,
                title: {
                    text: 'Primary Axis',
                },
                labels: {
                    enabled: true,
                },
            },
            {
                lineWidth: 1,
                opposite: true,
                title: {
                    text: 'Secondary Axis',
                },
            },
        ],
        tooltip: {
            shared: true,
            valueDecimals: 0,
        },
    },
} as HighchartsWidgetData;

export const AreaLine: Story = {
    render: () => <ChartStory data={data} />,
};
