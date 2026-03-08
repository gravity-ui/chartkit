import React from 'react';

import type {ChartData} from '@gravity-ui/charts';

import {render} from '../../../../test-utils/utils.js';

import {TestStory} from './TestStory.visual.js';

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

test('Validation should work when updating chart data (empty series)', async () => {
    const screen = await render(<TestStory data={VALID_CHART_DATA} />);

    const emptyData = {
        series: {
            data: [],
        },
        xAxis: {
            type: 'category',
        },
    };

    await screen.getByRole('textbox').fill(JSON.stringify(emptyData));
    await expect.element(screen.getByText('No data')).toBeVisible();
});
