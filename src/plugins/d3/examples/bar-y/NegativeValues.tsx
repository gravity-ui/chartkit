import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';
import marsWeatherData from '../mars-weather';

export const NegativeValues = () => {
    const data = marsWeatherData.map((d) => ({
        y: dateTime({input: d.terrestrial_date, format: 'YYYY-MM-DD'}).valueOf(),
        x: d.min_temp,
    }));

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'bar-y',
                    data: data,
                    name: 'Min temperature',
                },
            ],
        },
        xAxis: {
            title: {
                text: 'Min temperature',
            },
        },
        yAxis: [
            {
                type: 'datetime',
                title: {
                    text: 'Terrestrial date',
                },
            },
        ],
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
