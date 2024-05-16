import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import marsWeatherData from '../mars-weather';

export const TwoYAxis = () => {
    const data = marsWeatherData as any[];
    const minTempData = data.map((d) => ({
        x: dateTime({input: d.terrestrial_date, format: 'YYYY-MM-DD'}).valueOf(),
        y: d.min_temp,
    }));

    const maxTempData = data.map((d) => ({
        x: dateTime({input: d.terrestrial_date, format: 'YYYY-MM-DD'}).valueOf(),
        y: d.max_temp,
    }));

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'scatter',
                    data: minTempData,
                    name: 'Min Temperature',
                    yAxis: 0,
                },
                {
                    type: 'scatter',
                    data: maxTempData,
                    name: 'Max Temperature',
                    yAxis: 1,
                },
            ],
        },
        yAxis: [
            {
                title: {
                    text: 'Min',
                },
            },
            {
                title: {
                    text: 'Max',
                },
            },
        ],
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Terrestrial date',
            },
            ticks: {pixelInterval: 200},
        },
        title: {
            text: 'Mars weather',
        },
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
