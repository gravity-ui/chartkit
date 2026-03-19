import React from 'react';

import type {ChartData} from '@gravity-ui/charts';
import {page} from 'vitest/browser';

import {render} from '../../../../test-utils/utils.js';
import {settings} from '../../../libs/index.js';
import {GravityChartsPlugin} from '../index.js';

import {CHART_TEST_STORY_DATA_QA, ChartTestStory} from './ChartTestStory.js';

const SPLIT_TOOLTIP_DATA: ChartData = {
    series: {
        data: [
            {
                type: 'bar-x',
                name: 'Series 1',
                data: [
                    {x: 0, y: 40},
                    {x: 1, y: 55},
                ],
            },
        ],
    },
    xAxis: {type: 'category', categories: ['A', 'B']},
};

describe('Split tooltip visual tests', () => {
    beforeAll(() => {
        settings.set({plugins: [GravityChartsPlugin]});
    });

    test('should render tooltip in album orientation', async () => {
        await page.viewport(600, 280);
        const screen = await render(
            <ChartTestStory data={SPLIT_TOOLTIP_DATA} tooltip={{splitted: true}} />,
            {providers: {theme: 'dark'}},
        );
        await expect(screen.getByTestId(CHART_TEST_STORY_DATA_QA)).toMatchScreenshot();
    });

    test('should render tooltip in portrait orientation', async () => {
        await page.viewport(280, 400);
        const screen = await render(
            <ChartTestStory data={SPLIT_TOOLTIP_DATA} tooltip={{splitted: true}} />,
            {providers: {theme: 'dark'}},
        );
        await expect(screen.getByTestId(CHART_TEST_STORY_DATA_QA)).toMatchScreenshot();
    });
});
