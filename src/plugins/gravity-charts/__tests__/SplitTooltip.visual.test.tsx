import React from 'react';

import type {ChartData} from '@gravity-ui/charts';
import {page, userEvent} from 'vitest/browser';

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

function createRenderWaiter(expectedRenderCount: number) {
    let renderCount = 0;
    let resolveRender: () => void;
    const rendered = new Promise<void>((resolve) => {
        resolveRender = resolve;
    });

    return {
        rendered,
        onRender() {
            renderCount += 1;

            if (renderCount === expectedRenderCount) {
                resolveRender();
            }
        },
    };
}

describe('Split tooltip visual tests', () => {
    beforeAll(() => {
        settings.set({plugins: [GravityChartsPlugin]});
    });

    test('should render tooltip in album orientation', async () => {
        await page.viewport(600, 280);
        const renderWaiter = createRenderWaiter(1);
        const screen = await render(
            <ChartTestStory
                data={SPLIT_TOOLTIP_DATA}
                tooltip={{splitted: true}}
                onRender={renderWaiter.onRender}
            />,
            {providers: {theme: 'dark'}},
        );
        await renderWaiter.rendered;
        await expect(screen.getByTestId(CHART_TEST_STORY_DATA_QA)).toMatchScreenshot();
    });

    test('should render tooltip in portrait orientation', async () => {
        await page.viewport(280, 400);
        const renderWaiter = createRenderWaiter(2);
        const screen = await render(
            <ChartTestStory
                data={SPLIT_TOOLTIP_DATA}
                tooltip={{splitted: true}}
                onRender={renderWaiter.onRender}
            />,
            {providers: {theme: 'dark'}},
        );
        await renderWaiter.rendered;
        await expect(screen.getByTestId(CHART_TEST_STORY_DATA_QA)).toMatchScreenshot();
    });

    test('should use viewport orientation instead of container orientation', async () => {
        await page.viewport(600, 280);
        const renderWaiter = createRenderWaiter(1);
        const screen = await render(
            <ChartTestStory
                data={SPLIT_TOOLTIP_DATA}
                styles={{height: 400, width: 280}}
                tooltip={{splitted: true}}
                onRender={renderWaiter.onRender}
            />,
            {providers: {theme: 'dark'}},
        );
        await renderWaiter.rendered;

        await expect
            .element(screen.container.querySelector<HTMLElement>('.SplitPane'))
            .toHaveClass('vertical');
    });

    test('preserves tooltip content height and reflows the existing chart across orientation changes', async () => {
        await page.viewport(320, 500);
        const renderTestCase = (tooltipHeight: number) => (
            <ChartTestStory
                data={{
                    ...SPLIT_TOOLTIP_DATA,
                    tooltip: {
                        renderer: () => (
                            <div data-qa="long-tooltip" style={{height: tooltipHeight}}>
                                Long tooltip
                            </div>
                        ),
                    },
                }}
                tooltip={{splitted: true}}
            />
        );
        const screen = await render(renderTestCase(240));
        await expect.element(screen.getByTestId('long-tooltip')).toBeVisible();
        const mainPane = screen.container.querySelector<HTMLElement>('.Pane1');
        const tooltipPane = screen.container.querySelector<HTMLElement>('.Pane2');
        const splitPane = screen.container.querySelector<HTMLElement>('.SplitPane');
        const resizer = screen.container.querySelector<HTMLElement>('.Resizer');
        await expect.poll(() => mainPane?.getBoundingClientRect().height).toBe(236);
        await expect.poll(() => mainPane?.querySelector('.gcharts-bar-x__segment')).not.toBeNull();
        const bar = mainPane?.querySelector('.gcharts-bar-x__segment');
        if (!mainPane || !tooltipPane || !splitPane || !resizer || !bar) {
            throw new Error('Expected a rendered chart with split tooltip');
        }
        await userEvent.hover(bar);
        await expect.element(resizer).toBeVisible();

        const chart = mainPane.querySelector('.gcharts-chart');
        await userEvent.dragAndDrop(resizer, splitPane, {
            targetPosition: {x: 10, y: 352},
        });
        await expect.poll(() => mainPane.getBoundingClientRect().height).toBe(236);
        await expect
            .poll(() => chart?.querySelector('svg')?.getBoundingClientRect().height)
            .toBe(236);
        expect(tooltipPane.clientHeight).toBe(240);

        await screen.rerender(renderTestCase(400));
        await expect.poll(() => tooltipPane.scrollHeight).toBeGreaterThanOrEqual(400);
        await expect.poll(() => mainPane.getBoundingClientRect().height).toBe(76);
        expect(tooltipPane.clientHeight).toBe(400);

        await page.viewport(600, 300);
        await expect.element(splitPane).toHaveClass('vertical');
        await expect
            .poll(() => chart?.querySelector('svg')?.getBoundingClientRect().width)
            .toBe(360);
        await page.viewport(320, 500);
        await expect.element(splitPane).toHaveClass('horizontal');
        await expect
            .poll(() => chart?.querySelector('svg')?.getBoundingClientRect().height)
            .toBe(76);
        expect(mainPane.querySelector('.gcharts-chart')).toBe(chart);
    });
});
