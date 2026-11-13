import React from 'react';

import {vi} from 'vitest';

import {render} from '../../../../test-utils/utils.js';
import {ChartKit} from '../../../components/ChartKit.js';
import {settings} from '../../../libs/index.js';
import {YagrPlugin} from '../index.js';
import type {Yagr, YagrWidgetData} from '../types.js';

const DATA: YagrWidgetData = {
    data: {
        timeline: [1, 2, 3],
        graphs: [
            {
                id: 'values',
                type: 'line',
                _data: [
                    {value: 10, label: 'Plan'},
                    {value: 20, label: 'Actual'},
                    {value: 30, label: 'Total'},
                ],
                dataLabels: {enabled: true},
            },
        ],
    },
    libraryConfig: {
        chart: {size: {width: 600, height: 300}},
        scales: {y: {min: 0, max: 50}},
    },
};

const NORMALIZED_LABELS_DATA: YagrWidgetData = {
    data: {
        timeline: [1, 2],
        graphs: [
            {id: 'a', data: [10, 10], dataLabels: {enabled: true}},
            {id: 'b', data: [30, 30], dataLabels: {enabled: true}},
        ],
    },
    libraryConfig: {
        chart: {size: {width: 360, height: 240}},
        axes: {x: {values: (_u, values) => values.map(String)}},
        scales: {y: {stacking: true, normalize: true, min: 0, max: 100}},
    },
};

const OVERLAPPING_LABELS_DATA: YagrWidgetData = {
    data: {
        timeline: [1, 1.8, 2, 2.2, 3],
        graphs: [
            {
                id: 'values',
                _data: [
                    {value: 25, label: ''},
                    {value: 25, label: 'Point A'},
                    {value: 25, label: 'Point B'},
                    {value: 25, label: 'Point C'},
                    {value: 25, label: ''},
                ],
                dataLabels: {enabled: true},
            },
        ],
    },
    libraryConfig: {
        chart: {size: {width: 360, height: 240}},
        axes: {x: {values: (_u, values) => values.map(String)}},
        scales: {y: {min: 0, max: 50}},
    },
};

async function readPng(chart: Yagr) {
    const image = new Image();
    image.src = chart.toDataUrl();
    await image.decode();

    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Canvas context is unavailable');
    }

    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function hasSamePixels(first: ImageData, second: ImageData) {
    return (
        first.width === second.width &&
        first.height === second.height &&
        first.data.every((value, index) => value === second.data[index])
    );
}

describe('Yagr canvas labels integration', () => {
    beforeEach(() => {
        settings.set({plugins: [YagrPlugin]});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders normalized line labels at plot boundaries', async () => {
        let chart: Yagr | undefined;
        const screen = await render(
            <div data-qa="label-chart" style={{width: 360, height: 240}}>
                <ChartKit
                    type="yagr"
                    data={NORMALIZED_LABELS_DATA}
                    onChartLoad={({widget}) => {
                        chart = widget ?? undefined;
                    }}
                />
            </div>,
            {providers: {theme: 'dark'}},
        );
        await expect.poll(() => chart?.uplot.data[0]).toEqual(NORMALIZED_LABELS_DATA.data.timeline);
        await document.fonts.ready;
        chart?.redraw();

        await expect(screen.getByTestId('label-chart')).toMatchScreenshot();
    });

    test('hides overlapping point labels by default', async () => {
        let chart: Yagr | undefined;
        const screen = await render(
            <div data-qa="label-chart" style={{width: 360, height: 240}}>
                <ChartKit
                    type="yagr"
                    data={OVERLAPPING_LABELS_DATA}
                    onChartLoad={({widget}) => {
                        chart = widget ?? undefined;
                    }}
                />
            </div>,
        );
        await expect
            .poll(() => chart?.uplot.data[0])
            .toEqual(OVERLAPPING_LABELS_DATA.data.timeline);
        await document.fonts.ready;
        chart?.redraw();

        await expect(screen.getByTestId('label-chart')).toMatchScreenshot();
    });

    test('updates visibility, scale and size through widget props', async () => {
        const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');
        const adaptiveData: YagrWidgetData = {
            ...DATA,
            libraryConfig: {...DATA.libraryConfig, chart: {size: {adaptive: true}}},
        };
        let chart: Yagr | undefined;
        const renderWidget = (data: YagrWidgetData, width = 600) => (
            <div style={{width, height: 300}}>
                <ChartKit
                    type="yagr"
                    data={data}
                    onChartLoad={({widget}) => {
                        chart = widget ?? undefined;
                    }}
                />
            </div>
        );
        const screen = await render(renderWidget(adaptiveData));
        await expect.poll(() => chart).toBeDefined();
        const labels = () =>
            fillText.mock.calls.filter(([text]) => ['Plan', 'Actual', 'Total'].includes(text));

        const hidden: YagrWidgetData = {
            ...adaptiveData,
            data: {
                ...adaptiveData.data,
                graphs: adaptiveData.data.graphs.map((graph) => ({...graph, show: false})),
            },
        };
        fillText.mockClear();
        await screen.rerender(renderWidget(hidden));
        await expect.poll(() => chart?.uplot.series[1].show).toBe(false);
        expect(labels()).toEqual([]);

        fillText.mockClear();
        await screen.rerender(renderWidget(adaptiveData));
        await expect.poll(() => labels().map(([text]) => text)).toContain('Plan');

        const limitedRange: YagrWidgetData = {
            ...adaptiveData,
            libraryConfig: {
                ...adaptiveData.libraryConfig,
                scales: {...adaptiveData.libraryConfig.scales, y: {min: 15, max: 25}},
            },
        };
        fillText.mockClear();
        await screen.rerender(renderWidget(limitedRange));
        await expect.poll(() => labels().length).toBeGreaterThan(0);
        expect([...new Set(labels().map(([text]) => text))]).toEqual(['Actual']);

        const previousX = labels()[0][1];
        fillText.mockClear();
        await screen.rerender(renderWidget(limitedRange, 400));
        await expect.poll(() => labels().at(-1)?.[1]).toBeLessThan(previousX);
    });

    test('exports updated labels and removes them without changing values', async () => {
        const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');
        let chart: Yagr | undefined;
        const screen = await render(
            <div style={{width: 600, height: 300}}>
                <ChartKit
                    type="yagr"
                    data={DATA}
                    onChartLoad={({widget}) => {
                        chart = widget ?? undefined;
                    }}
                />
            </div>,
        );
        await expect.poll(() => chart).toBeDefined();
        if (!chart) {
            throw new Error('Yagr widget was not loaded');
        }

        const widget = chart;
        const readCanvas = () => {
            const {ctx} = widget.uplot;
            return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        };
        const original = await readPng(widget);
        expect(hasSamePixels(original, readCanvas())).toBe(true);

        const updated: YagrWidgetData = {
            ...DATA,
            data: {
                ...DATA.data,
                graphs: [
                    {
                        id: 'values',
                        type: 'line',
                        _data: [
                            {value: 15, label: 'Plan'},
                            {value: 25, label: 'Updated'},
                            {value: 35, label: 'Total'},
                        ],
                        dataLabels: {enabled: true},
                    },
                ],
            },
        };
        const renderWidget = (data: YagrWidgetData) => (
            <div style={{width: 600, height: 300}}>
                <ChartKit type="yagr" data={data} />
            </div>
        );

        fillText.mockClear();
        await screen.rerender(renderWidget(updated));
        await expect
            .poll(() =>
                fillText.mock.calls.some(
                    ([text], index) =>
                        text === 'Updated' && fillText.mock.contexts[index] === widget.uplot.ctx,
                ),
            )
            .toBe(true);
        expect(widget.uplot.data[1]).toEqual([15, 25, 35]);
        await expect
            .poll(async () => hasSamePixels(await readPng(widget), readCanvas()))
            .toBe(true);

        const withUpdatedLabels = await readPng(widget);
        expect(hasSamePixels(original, withUpdatedLabels)).toBe(false);

        const withoutLabels: YagrWidgetData = {
            ...updated,
            data: {
                ...updated.data,
                graphs: updated.data.graphs.map((graph) => ({
                    ...graph,
                    dataLabels: {enabled: false},
                })),
            },
        };
        fillText.mockClear();
        await screen.rerender(renderWidget(withoutLabels));
        await expect.poll(() => fillText.mock.calls.length).toBeGreaterThan(0);
        expect(widget.uplot.data[1]).toEqual([15, 25, 35]);
        expect(fillText.mock.calls.map(([text]) => text)).not.toContain('Updated');
        await expect
            .poll(async () => hasSamePixels(await readPng(widget), readCanvas()))
            .toBe(true);
        expect(hasSamePixels(withUpdatedLabels, await readPng(widget))).toBe(false);
    });
});
