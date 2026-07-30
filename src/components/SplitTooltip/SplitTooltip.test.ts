import {SplitLayout} from '../SplitPane';

import {
    SPLIT_TOOLTIP_RESIZER_SIZE,
    SplitTooltipLayout,
    getSplitTooltipLayout,
    getSplitTooltipMainPaneSize,
    getSplitTooltipSizeLimits,
} from './SplitTooltip';

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

    test('keeps size limits valid when tooltip is higher than the container', () => {
        expect(getSplitTooltipSizeLimits(100, 200)).toEqual({
            minSize: 0,
            maxSize: 0,
        });
    });
});
