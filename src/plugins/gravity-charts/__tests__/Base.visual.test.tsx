import type {ChartData} from '@gravity-ui/charts';

import {settings} from '../../../libs/index.js';
import {GravityChartsPlugin} from '../index.js';

import {CHART_TEST_STORY_DATA_QA, renderChartStory} from './ChartTestStory.js';

describe('GravityCharts base tests', () => {
    beforeAll(() => {
        settings.set({plugins: [GravityChartsPlugin]});
    });

    test('should render chart with valid data', async () => {
        const data: ChartData = {
            series: {
                data: [
                    {
                        type: 'line',
                        name: 'Line 1',
                        data: [
                            {x: 0, y: 100},
                            {x: 2, y: 80},
                            {x: 3, y: 120},
                        ],
                    },
                ],
            },
        };
        const screen = await renderChartStory({data});
        await expect(screen.getByTestId(CHART_TEST_STORY_DATA_QA)).toMatchScreenshot();
    });

    test('should display "No data" when series is empty', async () => {
        const data: ChartData = {series: {data: []}};
        const screen = await renderChartStory({data});
        await expect.element(screen.getByText('No data')).toBeVisible();
    });
});
