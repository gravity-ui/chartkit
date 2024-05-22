import React from 'react';

import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../ExampleWrapper';

export const NegativeValues = () => {
    const data = [
        {x: 0, y: 10},
        {x: 1, y: 20},
        {x: 2, y: -30},
        {x: 3, y: 100},
    ];

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
    };

    return (
        <ExampleWrapper>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};
