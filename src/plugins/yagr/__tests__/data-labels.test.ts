import {YagrDataLabelsPlugin as createDataLabelsPlugin} from '../plugins/YagrDataLabelsPlugin';
import {shapeYagrConfig} from '../renderer/utils';
import type {Yagr, YagrGraph, YagrWidgetData} from '../types';

function createChartMock(
    graphs: YagrGraph[] = [
        {id: 'a', _data: [{value: 20, label: 'Plan'}], dataLabels: {enabled: true}},
    ],
    libraryConfig: YagrWidgetData['libraryConfig'] = {},
) {
    const config = shapeYagrConfig({data: {timeline: [1], graphs}, libraryConfig, theme: 'light'});
    const ctx = {
        canvas: {width: 800},
        font: '',
        fillStyle: '',
        textAlign: '',
        textBaseline: '',
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillText: vi.fn(),
        measureText: vi.fn(() => ({
            width: 40,
            actualBoundingBoxAscent: 18,
            actualBoundingBoxDescent: 2,
        })),
    };
    const u = {
        ctx,
        width: 400,
        bbox: {left: 20, top: 20, width: 760, height: 480},
        series: [{}, ...config.series.map((series) => ({id: series.id, show: true, scale: 'y'}))],
        data: [[1], ...graphs.map(() => [30])],
        valToPos: vi.fn((value, scale) => (scale === 'x' ? value * 200 : value * 2)),
    } as unknown as Yagr['uplot'];
    const chart = {
        config,
        root: {},
        utils: {colors: {parse: vi.fn(() => 'rgb(1, 2, 3)')}},
    } as unknown as Yagr;
    const hooks = createDataLabelsPlugin(chart).uplot.hooks.draw;
    const hook = Array.isArray(hooks) ? hooks[0] : hooks;
    if (typeof hook !== 'function') throw new Error('Missing draw hook');

    return {ctx, u, chart, draw: () => hook(u)};
}

describe('YagrDataLabelsPlugin', () => {
    beforeEach(() => vi.stubGlobal('getComputedStyle', () => ({fontFamily: 'Arial'})));
    afterEach(() => vi.unstubAllGlobals());

    const pixelRatioCases = [
        {ratio: 1, font: 'bold 11px Arial', labelY: 55},
        {ratio: 1.5, font: 'bold 16.5px Arial', labelY: 52.5},
        {ratio: 2, font: 'bold 22px Arial', labelY: 50},
    ];

    test.each(pixelRatioCases)(
        'draws source text at prepared coordinates with pixel ratio $ratio',
        ({ratio, font, labelY}) => {
            const {ctx, u, draw} = createChartMock();
            ctx.canvas.width = 400 * ratio;
            draw();

            expect(ctx.fillText).toHaveBeenCalledWith('Plan', 200, labelY);
            expect(u.valToPos).toHaveBeenCalledWith(30, 'y', true);
            expect(ctx.font).toBe(font);
            expect(ctx.fillStyle).toBe('rgb(1, 2, 3)');
        },
    );

    const disabledCases: YagrGraph[] = [
        {_data: [{value: 20, label: 'Plan'}]},
        {_data: [{value: 20, label: 'Plan'}], dataLabels: {enabled: false}},
        {data: [20], type: 'column', dataLabels: {enabled: true}},
        {data: [20], type: 'area', dataLabels: {enabled: true}},
        {data: [20], type: 'dots', dataLabels: {enabled: true}},
    ];
    test.each(disabledCases)('ignores disabled labels and non-line types: %j', (graph) => {
        const {ctx, draw} = createChartMock([{...graph, id: 'a'}]);
        draw();
        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    test('resolves the common type with a per-series override', () => {
        const graph: YagrGraph = {id: 'a', data: [20], dataLabels: {enabled: true}};
        const hidden = createChartMock([graph], {chart: {series: {type: 'column'}}});
        hidden.draw();
        expect(hidden.ctx.fillText).not.toHaveBeenCalled();

        const visible = createChartMock([{...graph, type: 'line'}], {
            chart: {series: {type: 'column'}},
        });
        visible.draw();
        expect(visible.ctx.fillText).toHaveBeenCalledWith('20', 200, 50);
    });

    test('uses the effective uPlot series type', () => {
        const {u, ctx, draw} = createChartMock();
        u.series[1].type = 'column';
        draw();
        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    test('handles default text, empty text, null values and zero', () => {
        const graph: YagrGraph = {
            id: 'a',
            _data: [
                {value: 10, label: 'Plan'},
                {value: 20},
                {value: 15, label: ''},
                {value: null, label: 'Missing'},
                {value: 0, label: null},
            ],
            dataLabels: {enabled: true},
        };
        const {u, ctx, draw} = createChartMock([graph]);
        u.data[0] = [1, 1.5, 2, 2.5, 3];
        u.data[1] = [30, 30, 30, 30, 30];
        draw();
        expect(ctx.fillText.mock.calls.map(([text]) => text)).toEqual(['Plan', '20', '0']);
    });

    const pointOverlapCases = [
        {allowOverlap: undefined, expected: ['Upper', 'Left']},
        {allowOverlap: true, expected: ['Lower', 'Right', 'Upper', 'Left']},
    ];

    test.each(pointOverlapCases)(
        'filters labels by y then x unless overlap is allowed: $allowOverlap',
        ({allowOverlap, expected}) => {
            const graph: YagrGraph = {
                id: 'a',
                _data: [
                    {value: 1, label: 'Lower'},
                    {value: 1, label: 'Right'},
                    {value: 1, label: 'Upper'},
                    {value: 1, label: 'Left'},
                ],
                dataLabels: {enabled: true, allowOverlap},
            };
            const {ctx, u, draw} = createChartMock([graph]);
            u.data[0] = [200, 220, 200, 200];
            u.data[1] = [212, 200, 180, 200];
            vi.mocked(u.valToPos).mockImplementation((value) => value);

            draw();
            expect(ctx.fillText.mock.calls.map(([text]) => text)).toEqual(expected);

            ctx.fillText.mockClear();
            draw();
            expect(ctx.fillText.mock.calls.map(([text]) => text)).toEqual(expected);
        },
    );

    const overlappingSeries: YagrGraph[] = [
        {
            id: 'first',
            _data: [{value: 1, label: 'First'}, {value: null}, {value: null}],
        },
        {
            id: 'middle',
            _data: [{value: null}, {value: 1, label: 'Middle'}, {value: null}],
        },
        {
            id: 'last',
            _data: [{value: null}, {value: null}, {value: 1, label: 'Last'}],
        },
    ];
    const seriesOverlapCases = [
        {allowOverlap: undefined, expected: ['Last', 'First']},
        {allowOverlap: true, expected: ['Last', 'Middle']},
    ];

    test.each(seriesOverlapCases)(
        'prioritizes later series and keeps allowed overlaps as obstacles: $allowOverlap',
        ({allowOverlap, expected}) => {
            const graphs = overlappingSeries.map((graph) => ({
                ...graph,
                dataLabels: {
                    enabled: true,
                    allowOverlap: graph.id === 'middle' ? allowOverlap : undefined,
                },
            }));
            const {ctx, u, draw} = createChartMock(graphs);
            u.data[0] = [1, 1.1, 1.2];
            u.data[1] = [30, null, null];
            u.data[2] = [null, 30, null];
            u.data[3] = [null, null, 30];
            draw();
            expect(ctx.fillText.mock.calls.map(([text]) => text)).toEqual(expected);
        },
    );

    test('keeps padding above the actual text bounds with a negative descent', () => {
        const {ctx, u, draw} = createChartMock();
        ctx.measureText.mockReturnValue({
            width: 40,
            actualBoundingBoxAscent: 20,
            actualBoundingBoxDescent: -4,
        });
        vi.mocked(u.valToPos).mockImplementation((_value, scale) =>
            scale === 'x' ? 200 : u.bbox.top,
        );
        draw();
        expect(ctx.fillText).toHaveBeenCalledWith('Plan', 200, 50);
    });

    test('reads replacement config by id on every draw, including padding zero', () => {
        const {ctx, draw, chart} = createChartMock();
        draw();
        const replacement = shapeYagrConfig({
            data: {
                timeline: [1],
                graphs: [
                    {
                        id: 'a',
                        _data: [{value: 4, label: 'Updated'}],
                        dataLabels: {enabled: true, padding: 0},
                    },
                ],
            },
            libraryConfig: {},
            theme: 'light',
        });
        chart.config.series = replacement.series;
        ctx.fillText.mockClear();
        draw();
        expect(ctx.fillText).toHaveBeenCalledWith('Updated', 200, 60);
    });

    test('resolves series by id with independent padding when uPlot order differs', () => {
        const graphs: YagrGraph[] = [
            {id: 'a', data: [20], dataLabels: {enabled: true, padding: 0}},
            {id: 'b', data: [10], dataLabels: {enabled: true, padding: 8}},
        ];
        const {ctx, u, draw} = createChartMock(graphs);
        [u.series[1], u.series[2]] = [u.series[2], u.series[1]];
        u.data[1] = [150];
        u.data[2] = [100];
        draw();
        expect(ctx.fillText.mock.calls).toEqual([
            ['10', 200, 284],
            ['20', 200, 200],
        ]);
    });

    test('skips hidden series and missing prepared values', () => {
        const {ctx, u, draw} = createChartMock();
        u.series[1].show = false;
        draw();
        u.series[1].show = true;
        u.series[1].showInGraph = false;
        draw();
        u.series[1].showInGraph = true;
        u.data[1][0] = null;
        draw();
        u.data[1][0] = NaN;
        draw();
        expect(ctx.fillText).not.toHaveBeenCalled();
    });

    test('moves text inside boundaries and skips points outside the viewport', () => {
        const {ctx, u, chart, draw} = createChartMock();
        const graph: YagrGraph = {
            id: 'a',
            data: [1, 1, 1, 1, 1, 1, 1, 1],
            dataLabels: {enabled: true},
        };
        chart.config.series = shapeYagrConfig({
            data: {timeline: [], graphs: [graph]},
            libraryConfig: {},
            theme: 'light',
        }).series;
        u.data[0] = [20, 780, 400, 400, 19, 781, 400, 400];
        u.data[1] = [200, 200, 20, 500, 200, 200, 19, 501];
        vi.mocked(u.valToPos).mockImplementation((value) => value);
        draw();
        expect(ctx.fillText.mock.calls).toEqual([
            ['1', 400, 48],
            ['1', 40, 190],
            ['1', 760, 190],
            ['1', 400, 490],
        ]);
    });

    test('centers labels wider than the plot', () => {
        const {ctx, draw} = createChartMock();
        ctx.measureText.mockReturnValue({
            width: 800,
            actualBoundingBoxAscent: 18,
            actualBoundingBoxDescent: 2,
        });
        draw();
        expect(ctx.fillText).toHaveBeenCalledWith('Plan', 400, 50);
    });

    test('restores the canvas state if drawing fails', () => {
        const {ctx, draw} = createChartMock();
        ctx.fillText.mockImplementation(() => {
            throw new Error('Drawing failed');
        });
        expect(draw).toThrow('Drawing failed');
        expect(ctx.restore).toHaveBeenCalledOnce();
    });
});
