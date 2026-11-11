import type {Yagr, YagrConfig} from '../../../types.js';
import {getLabelHooks} from '../index.js';

function createYagrChart() {
    const ctx = {
        canvas: {width: 800},
        font: '',
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({width: 40})),
    };
    const root = {};
    const sourceData: (number | null)[] = [20];
    const series = {
        id: 'a',
        show: true,
        scale: 'y',
        type: 'line',
        $c: sourceData,
        pointLabels: ['Prepared'],
    };
    const uplot = {
        ctx,
        root,
        width: 400,
        bbox: {left: 20, top: 20, width: 760, height: 480},
        series: [{}, series],
        data: [[1], [30]],
        valToPos: vi.fn((value, scale) => (scale === 'x' ? value * 200 : value * 2)),
    } as unknown as Yagr['uplot'];
    const existingDraw = vi.fn();
    const originalHooks: YagrConfig['hooks'] = {draw: [existingDraw]};
    const hooks = getLabelHooks(originalHooks);
    const chart = {
        config: {
            scales: {y: {stacking: true}},
        },
    };
    const handleProcessed = hooks.processed?.[0];
    const draw = hooks.draw?.[1];
    if (!handleProcessed || !draw) {
        throw new Error('Expected Yagr label handlers');
    }

    handleProcessed({
        chart: chart as unknown as Yagr,
        meta: {processTime: 0},
    });

    return {
        ctx,
        uplot,
        series,
        chart,
        hooks,
        originalHooks,
        existingDraw,
        draw,
    };
}

describe('Yagr point labels', () => {
    beforeEach(() => {
        vi.stubGlobal('getComputedStyle', () => ({
            fontFamily: 'Arial',
            color: 'black',
            getPropertyValue: () => '',
        }));
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('preserves caller hooks without changing their arrays', () => {
        const {hooks, originalHooks, existingDraw} = createYagrChart();

        expect(originalHooks.draw).toEqual([existingDraw]);
        expect(originalHooks.processed).toBeUndefined();
        expect(hooks.draw).toContain(existingDraw);
    });

    test('draws prepared plain text only for visible series, including zero values', () => {
        const {ctx, uplot, series, draw} = createYagrChart();
        series.$c = [0];
        series.pointLabels = ['<b>Plan</b> **0**'];

        draw(uplot);
        expect(ctx.fillText).toHaveBeenCalledWith('<b>Plan</b> **0**', 200, 52);

        series.show = false;
        ctx.fillText.mockClear();
        draw(uplot);
        expect(ctx.fillText).not.toHaveBeenCalled();

        series.show = true;
        uplot.series[1].showInGraph = false;
        draw(uplot);
        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    const columnCases = [
        {
            name: 'positive stack',
            value: 20,
            coordinate: 30,
            stacking: true,
            normalized: undefined,
            expectedY: 332,
        },
        {
            name: 'negative stack',
            value: -20,
            coordinate: -30,
            stacking: true,
            normalized: undefined,
            expectedY: 412,
        },
        {
            name: 'negative column',
            value: -20,
            coordinate: -20,
            stacking: false,
            normalized: undefined,
            expectedY: 392,
        },
        {
            name: 'percentage stack',
            value: 20,
            coordinate: 100,
            stacking: true,
            normalized: 66,
            expectedY: 192,
        },
    ];

    test.each(columnCases)(
        'positions the label above the $name segment',
        ({value, coordinate, stacking, normalized, expectedY}) => {
            const {ctx, uplot, series, chart, draw} = createYagrChart();
            series.$c = [value];
            series.pointLabels = ['20'];
            chart.config.scales.y.stacking = stacking;
            uplot.series[1].type = 'column';
            uplot.series[1].normalizedData = normalized === undefined ? undefined : [normalized];
            uplot.data[1][0] = coordinate;
            vi.mocked(uplot.valToPos).mockImplementation((v, scale) =>
                scale === 'x' ? v * 200 : 400 - v * 2,
            );

            draw(uplot);

            expect(ctx.fillText).toHaveBeenCalledWith('20', 200, expectedY);
        },
    );

    test('skips missing source values and coordinates even in stacked series', () => {
        const {ctx, uplot, series, draw} = createYagrChart();
        series.$c = [null];
        draw(uplot);
        expect(ctx.fillText).not.toHaveBeenCalled();

        series.$c = [0];
        uplot.data[1][0] = null;
        draw(uplot);
        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    test('keeps constant column labels inside the plot at the upper scale boundary', () => {
        const {ctx, uplot, series, draw} = createYagrChart();
        series.$c = [50, 50];
        series.pointLabels = ['50', '50'];
        uplot.series[1].type = 'column';
        uplot.data[0] = [1, 2];
        uplot.data[1] = [50, 50];
        vi.mocked(uplot.valToPos).mockImplementation((value, scale) =>
            scale === 'x' ? value * 200 : 220 - value * 4,
        );

        draw(uplot);

        expect(ctx.font).toBe('500 24px Arial');
        expect(ctx.fillText.mock.calls).toEqual([
            ['50', 200, 44],
            ['50', 400, 44],
        ]);
    });

    test('keeps labels within the left, right and bottom plot boundaries', () => {
        const {ctx, uplot, series, draw} = createYagrChart();
        series.$c = [20, 20, 20];
        series.pointLabels = ['20', '20', '20'];
        uplot.data[0] = [20, 780, 400];
        uplot.data[1] = [200, 200, 500];
        vi.mocked(uplot.valToPos).mockImplementation((value) => value);

        draw(uplot);

        expect(ctx.fillText.mock.calls).toEqual([
            ['20', 40, 192],
            ['20', 760, 192],
            ['20', 400, 492],
        ]);
    });

    test('does not move labels of points outside the plot into view', () => {
        const {ctx, uplot, series, draw} = createYagrChart();
        series.$c = [20, 20, 20, 20];
        series.pointLabels = ['20', '20', '20', '20'];
        uplot.data[0] = [19, 781, 400, 400];
        uplot.data[1] = [200, 200, 19, 501];
        vi.mocked(uplot.valToPos).mockImplementation((value) => value);

        draw(uplot);

        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    test('hides labels wider than the plot', () => {
        const {ctx, uplot, draw} = createYagrChart();
        ctx.measureText.mockReturnValue({width: 800});

        draw(uplot);

        expect(ctx.fillText).not.toHaveBeenCalled();
    });
});
