import React from 'react';

import {vi} from 'vitest';

import {render} from '../../../../../../test-utils/utils.js';
import {ChartKit} from '../../../../../components/ChartKit.js';
import {settings} from '../../../../../libs/index.js';
import {YagrPlugin} from '../../../index.js';
import type {Yagr, YagrWidgetData} from '../../../types.js';

const DATA: YagrWidgetData = {
    data: {
        timeline: [1, 2, 3],
        graphs: [{data: [10, 20, 30], pointLabels: ['Plan', 'Actual', 'Total']}],
    },
    libraryConfig: {
        chart: {size: {width: 600, height: 300}},
        scales: {y: {min: 0, max: 50}},
    },
};

const BOUNDARY_LABELS_DATA: YagrWidgetData = {
    data: {
        timeline: [1, 2, 3, 4],
        graphs: [
            {
                id: 'values',
                data: [0, 20, null, 40],
                pointLabels: ['Left boundary', 'Middle', 'Missing', 'Upper boundary'],
            },
        ],
    },
    libraryConfig: {scales: {y: {min: 0, max: 40}}},
};

const STACKED_LABELS_DATA: YagrWidgetData = {
    data: {
        timeline: [1, 2, 3],
        graphs: [
            {
                id: 'a',
                color: 'var(--g-color-base-info-light)',
                data: [10, 20, -15],
                pointLabels: ['10', '20', '-15'],
            },
            {
                id: 'b',
                color: 'var(--g-color-base-positive-light)',
                data: [20, 10, -10],
                pointLabels: ['20', '10', '-10'],
            },
        ],
    },
    libraryConfig: {
        chart: {series: {type: 'column'}},
        scales: {y: {stacking: true, min: -40, max: 40}},
    },
};

const NORMALIZED_LABELS_DATA: YagrWidgetData = {
    data: {
        timeline: [1, 2, 3],
        graphs: [
            {
                id: 'a',
                color: 'var(--g-color-base-info-light)',
                data: [10, 20, 30],
                pointLabels: ['25%', '50%', '75%'],
            },
            {
                id: 'b',
                color: 'var(--g-color-base-positive-light)',
                data: [30, 20, 10],
                pointLabels: ['75%', '50%', '25%'],
            },
        ],
    },
    libraryConfig: {
        chart: {series: {type: 'column'}},
        scales: {y: {stacking: true, normalize: true, min: 0, max: 100}},
    },
};

const SCREENSHOT_CASES = [
    {
        name: 'line labels at plot boundaries in dark theme',
        theme: 'dark',
        data: BOUNDARY_LABELS_DATA,
    },
    {
        name: 'positive and negative stacked column labels',
        theme: 'light',
        data: STACKED_LABELS_DATA,
    },
    {name: 'normalized stacked column labels', theme: 'light', data: NORMALIZED_LABELS_DATA},
];

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
    beforeAll(async () => {
        await import('../../YagrWidget.js');
    });

    beforeEach(() => {
        settings.set({plugins: [YagrPlugin]});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test.each(SCREENSHOT_CASES)('$name', async ({theme, data}) => {
        let chart: Yagr | undefined;
        const chartData: YagrWidgetData = {
            ...data,
            libraryConfig: {
                ...data.libraryConfig,
                chart: {...data.libraryConfig.chart, size: {width: 360, height: 240}},
                axes: {x: {values: (_u, values) => values.map(String)}},
            },
        };
        const screen = await render(
            <div data-qa="label-chart" style={{width: 360, height: 240}}>
                <ChartKit
                    type="yagr"
                    data={chartData}
                    onChartLoad={({widget}) => {
                        chart = widget ?? undefined;
                    }}
                />
            </div>,
            {providers: {theme}},
        );

        await expect.poll(() => chart?.uplot.data[0]).toEqual(data.data.timeline);
        await document.fonts.ready;
        chart?.redraw();

        await expect(screen.getByTestId('label-chart')).toMatchScreenshot();
    });

    test('updates values and labels, removes and re-enables labels on the real widget', async () => {
        const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');
        const drawnTexts = () => fillText.mock.calls.map(([text]) => text);
        let chart: Yagr | undefined;
        const onChartLoad = ({widget}: {widget?: Yagr | null}) => {
            chart = widget ?? undefined;
        };
        const widget = (data: YagrWidgetData) => (
            <div style={{width: 600, height: 300}}>
                <ChartKit type="yagr" data={data} onChartLoad={onChartLoad} />
            </div>
        );
        const screen = await render(widget(DATA));
        await expect.poll(() => chart).toBeDefined();
        await expect.poll(drawnTexts).toContain('Plan');

        const updated: YagrWidgetData = {
            ...DATA,
            data: {
                timeline: [1, 2, 3],
                graphs: [{data: [30, null, 0], pointLabels: ['Updated', 'Gap', 'Zero']}],
            },
        };
        fillText.mockClear();
        await screen.rerender(widget(updated));
        await expect.poll(drawnTexts).toContain('Updated');
        expect(drawnTexts()).toContain('Zero');
        expect(drawnTexts()).not.toContain('Plan');
        expect(drawnTexts()).not.toContain('Gap');
        expect(chart?.uplot.data[1]).toEqual([30, null, 0]);

        const withoutLabels: YagrWidgetData = {
            ...updated,
            data: {...updated.data, graphs: [{data: [30, null, 0]}]},
        };
        fillText.mockClear();
        await screen.rerender(widget(withoutLabels));
        await expect.poll(() => fillText.mock.calls.length).toBeGreaterThan(0);
        expect(drawnTexts()).not.toContain('Updated');
        expect(drawnTexts()).not.toContain('Zero');

        fillText.mockClear();
        await screen.rerender(widget(updated));
        await expect.poll(drawnTexts).toContain('Updated');
    });

    test('exports the current canvas with labels and after labels are removed', async () => {
        let chart: Yagr | undefined;
        await render(
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
        const withLabels = await readPng(widget);
        expect(hasSamePixels(withLabels, readCanvas())).toBe(true);

        widget.setConfig({series: [{data: [10, 20, 30]}]});
        await expect
            .poll(async () => hasSamePixels(await readPng(widget), readCanvas()))
            .toBe(true);

        const withoutLabels = await readPng(widget);
        expect(hasSamePixels(withLabels, withoutLabels)).toBe(false);
    });
});
