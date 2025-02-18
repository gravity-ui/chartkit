import React from 'react';

import type {ChartData} from '@gravity-ui/charts';
import {expect, test} from '@playwright/experimental-ct-react17';

import {TestStory} from './TestStory.visual';

const VALID_CHART_DATA = {
    series: {
        data: [
            {
                type: 'line',
                data: [{x: 0, y: 100}],
            },
        ],
    },
    xAxis: {
        type: 'category',
        categories: ['A'],
    },
} as ChartData;

test('Validation should work when updating chart data (empty series)', async ({mount}) => {
    const component = await mount(<TestStory data={VALID_CHART_DATA} />);

    const emptyData = {
        series: {
            data: [],
        },
        xAxis: {
            type: 'category',
        },
    };
    await component.locator('input').fill(JSON.stringify(emptyData));
    await expect(component).toHaveText('No data');
});
