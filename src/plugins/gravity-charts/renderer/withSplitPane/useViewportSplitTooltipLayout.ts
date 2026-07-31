import React from 'react';

import type {SplitTooltipLayout} from '../../../../components/SplitTooltip';
import {IS_WINDOW_AVAILABLE} from '../../../../constants';

export function getViewportSplitTooltipLayout(width: number, height: number): SplitTooltipLayout {
    return width > height ? 'vertical' : 'horizontal';
}

function getCurrentViewportLayout(): SplitTooltipLayout {
    if (!IS_WINDOW_AVAILABLE) {
        return 'horizontal';
    }

    return getViewportSplitTooltipLayout(window.innerWidth, window.innerHeight);
}

export function useViewportSplitTooltipLayout() {
    const [layout, setLayout] = React.useState<SplitTooltipLayout>(getCurrentViewportLayout);

    React.useLayoutEffect(() => {
        if (!IS_WINDOW_AVAILABLE) {
            return undefined;
        }

        const handleViewportChange = () => {
            setLayout(getCurrentViewportLayout());
        };

        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('orientationchange', handleViewportChange);

        return () => {
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('orientationchange', handleViewportChange);
        };
    }, []);

    return layout;
}
