import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import marsWeatherData from '../mars-weather';

export const NegativeValues = () => {
    const data = marsWeatherData.map((d) => ({
        x: dateTime({input: d.terrestrial_date, format: 'YYYY-MM-DD'}).valueOf(),
        y: d.min_temp,
    }));

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'area',
                    data: data,
                    name: 'Min temperature',
                },
            ],
        },
        yAxis: [
            {
                title: {
                    text: 'Min temperature',
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
