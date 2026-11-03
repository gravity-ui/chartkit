import {SplitLayout} from '../../SplitPane';
import {
    SPLIT_TOOLTIP_RESIZER_SIZE,
    SplitTooltipLayout,
    getSplitTooltipLayout,
    getSplitTooltipMainPaneSize,
    getSplitTooltipSizeLimits,
} from '../SplitTooltip';

describe('SplitTooltip', () => {
    test('exposes layout values as part of the public component API', () => {
        const layout: SplitTooltipLayout = SplitTooltipLayout.VERTICAL;

        expect(layout).toBe('vertical');
        expect(SplitTooltipLayout.HORIZONTAL).toBe('horizontal');
    });

    test('uses horizontal layout in portrait orientation', () => {
        expect(getSplitTooltipLayout(320, 640)).toBe(SplitLayout.HORIZONTAL);
    });

    test('uses vertical layout in landscape orientation', () => {
        expect(getSplitTooltipLayout(640, 320)).toBe(SplitLayout.VERTICAL);
    });

    test('uses explicit layout instead of container orientation', () => {
        expect(getSplitTooltipLayout(320, 640, SplitLayout.VERTICAL)).toBe(SplitLayout.VERTICAL);
        expect(getSplitTooltipLayout(640, 320, SplitLayout.HORIZONTAL)).toBe(
            SplitLayout.HORIZONTAL,
        );
    });

    test('reserves tooltip height in horizontal layout', () => {
        expect(
            getSplitTooltipMainPaneSize({
                containerHeight: 640,
                containerWidth: 320,
                layout: SplitLayout.HORIZONTAL,
                tooltipHeight: 120,
            }),
        ).toBe(640 - SPLIT_TOOLTIP_RESIZER_SIZE - 120);
    });

    test('uses container width ratio in vertical layout', () => {
        expect(
            getSplitTooltipMainPaneSize({
                containerHeight: 320,
                containerWidth: 640,
                layout: SplitLayout.VERTICAL,
                tooltipHeight: 120,
            }),
        ).toBe(384);
    });

    test('does not produce a negative main pane size', () => {
        expect(
            getSplitTooltipMainPaneSize({
                containerHeight: 100,
                containerWidth: 320,
                layout: SplitLayout.HORIZONTAL,
                tooltipHeight: 200,
            }),
        ).toBe(0);
    });

    test('keeps the main pane minimum with a long tooltip', () => {
        expect(
            getSplitTooltipMainPaneSize({
                containerHeight: 400,
                containerWidth: 300,
                layout: SplitLayout.HORIZONTAL,
                minMainPaneSize: 120,
                tooltipHeight: 800,
            }),
        ).toBe(120);
    });

    test('adapts an explicit minimum to half the available height', () => {
        expect(
            getSplitTooltipMainPaneSize({
                containerHeight: 200,
                containerWidth: 300,
                layout: SplitLayout.HORIZONTAL,
                minMainPaneSize: 120,
                tooltipHeight: 800,
            }),
        ).toBe(88);
    });

    test('does not apply the height minimum in vertical layout', () => {
        expect(
            getSplitTooltipMainPaneSize({
                containerHeight: 400,
                containerWidth: 100,
                layout: SplitLayout.VERTICAL,
                minMainPaneSize: 120,
                tooltipHeight: 800,
            }),
        ).toBe(60);
    });

    test('reserves tooltip content height in the default drag limits', () => {
        expect(getSplitTooltipSizeLimits(400, 120)).toEqual({minSize: 400 / 3, maxSize: 256});
        expect(getSplitTooltipSizeLimits(400, 320)).toEqual({minSize: 56, maxSize: 56});
        expect(getSplitTooltipSizeLimits(100, 200)).toEqual({minSize: 0, maxSize: 0});
    });

    test('allows scrolling a long tooltip when a main pane minimum is set', () => {
        expect(getSplitTooltipSizeLimits(400, 800, 120)).toEqual({
            minSize: 120,
            maxSize: 376,
        });
    });

    test('reserves only the resizer when a main pane minimum is set', () => {
        expect(getSplitTooltipSizeLimits(400, 120, 120)).toEqual({
            minSize: 120,
            maxSize: 376,
        });
        expect(getSplitTooltipSizeLimits(200, 120, 120)).toEqual({minSize: 88, maxSize: 176});
    });

    test.each([0, 12, SPLIT_TOOLTIP_RESIZER_SIZE])(
        'keeps limits valid when the container height is %i',
        (containerHeight) => {
            expect(getSplitTooltipSizeLimits(containerHeight, 120, 120)).toEqual({
                minSize: 0,
                maxSize: 0,
            });
        },
    );

    test('does not allow a negative minimum', () => {
        expect(getSplitTooltipSizeLimits(400, 0, -120)).toEqual({
            minSize: 0,
            maxSize: 376,
        });
    });
});
