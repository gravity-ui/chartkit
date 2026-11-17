import React from 'react';

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
                data: [],
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

const UPDATED_DATA: YagrWidgetData = {
    ...DATA,
    data: {
        ...DATA.data,
        graphs: [
            {
                id: 'values',
                type: 'line',
                data: [],
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
                data: [],
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

async function renderYagr(data: YagrWidgetData) {
    const {width = 360, height = 240} = data.libraryConfig.chart?.size ?? {};
    let chart: Yagr | undefined;
    const screen = await render(
        <div data-qa="label-chart" style={{width, height}}>
            <ChartKit
                type="yagr"
                data={data}
                onChartLoad={({widget}) => {
                    chart = widget ?? undefined;
                }}
            />
        </div>,
    );
    await expect.poll(() => chart?.uplot.data[0]).toEqual(data.data.timeline);
    if (!chart) {
        throw new Error('Yagr widget was not loaded');
    }

    await document.fonts.ready;
    chart.redraw();

    return {screen, chart};
}

describe('Yagr canvas labels integration', () => {
    beforeEach(() => {
        settings.set({plugins: [YagrPlugin]});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders normalized line labels at plot boundaries', async () => {
        const {screen} = await renderYagr(NORMALIZED_LABELS_DATA);

        await expect(screen.getByTestId('label-chart')).toMatchScreenshot();
    });

    test('hides overlapping point labels by default', async () => {
        const {screen} = await renderYagr(OVERLAPPING_LABELS_DATA);

        await expect(screen.getByTestId('label-chart')).toMatchScreenshot();
    });

    test('exports the current canvas after an update', async () => {
        const fillText = vi.spyOn(CanvasRenderingContext2D.prototype, 'fillText');
        const {screen, chart} = await renderYagr(DATA);

        fillText.mockClear();
        await screen.rerender(
            <div data-qa="label-chart" style={{width: 600, height: 300}}>
                <ChartKit type="yagr" data={UPDATED_DATA} />
            </div>,
        );
        await expect
            .poll(() =>
                fillText.mock.calls.some(
                    ([text], index) =>
                        text === 'Updated' && fillText.mock.contexts[index] === chart.uplot.ctx,
                ),
            )
            .toBe(true);
        expect(chart.canvas).toBe(chart.uplot.ctx.canvas);
    });
});
