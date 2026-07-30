import {getViewportSplitTooltipLayout} from './useViewportSplitTooltipLayout';

describe('getViewportSplitTooltipLayout', () => {
    test('uses vertical layout for a landscape viewport', () => {
        expect(getViewportSplitTooltipLayout(640, 320)).toBe('vertical');
    });

    test('uses horizontal layout for a portrait or square viewport', () => {
        expect(getViewportSplitTooltipLayout(320, 640)).toBe('horizontal');
        expect(getViewportSplitTooltipLayout(320, 320)).toBe('horizontal');
    });
});
