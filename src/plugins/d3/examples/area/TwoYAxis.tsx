import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import marsWeatherData from '../mars-weather';

export const TwoYAxis = () => {
    const data = marsWeatherData.slice(-100) as any[];
    const pressureData = data.map((d) => ({
        x: dateTime({input: d.terrestrial_date, format: 'YYYY-MM-DD'}).valueOf(),
        y: d.pressure,
    }));

    const tempData = data.map((d) => ({
        x: dateTime({input: d.terrestrial_date, format: 'YYYY-MM-DD'}).valueOf(),
        y: d.max_temp - d.min_temp,
    }));

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'area',
                    data: pressureData,
                    name: 'Pressure',
                    yAxis: 0,
                },
                {
                    type: 'area',
                    data: tempData,
                    name: 'Temperature range',
                    yAxis: 1,
                },
            ],
        },
        yAxis: [
            {
                title: {
                    text: 'Pressure',
                },
            },
            {
                title: {
                    text: 'Temperature range',
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
