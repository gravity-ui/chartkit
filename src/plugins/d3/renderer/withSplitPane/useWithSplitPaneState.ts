import React from 'react';

import {SplitLayout} from '../../../../components/SplitPane';
import type {SplitLayoutType} from '../../../../components/SplitPane';
import {IS_WINDOW_AVAILABLE} from '../../../../constants';

const CHART_SECTION_PERCENTAGE = 0.6;
export const RESIZER_HEIGHT = 24;

type WithSplitPaneState = {
    allowResize: boolean;
    tooltipHeight: number;
    setTooltipHeight: (value: number) => void;
    split: SplitLayoutType;
    setSplit: (value: SplitLayoutType) => void;
    size: number | string;
    setSize: (value: number | string) => void;
    maxSize?: number;
    minSize?: number;
};

function getInitialSplit(): SplitLayoutType {
    if (!IS_WINDOW_AVAILABLE) {
        return SplitLayout.HORIZONTAL;
    }

    return window.innerWidth > window.innerHeight ? SplitLayout.VERTICAL : SplitLayout.HORIZONTAL;
}

type UseWithSplitPaneProps = {
    container: HTMLDivElement | null;
};

export function getVerticalSize() {
    return window.innerWidth * CHART_SECTION_PERCENTAGE;
}

function getInitialSize(split: SplitLayoutType) {
    const defaultSize = '50%';

    if (!IS_WINDOW_AVAILABLE) {
        return defaultSize;
    }

    return split === SplitLayout.VERTICAL ? getVerticalSize() : defaultSize;
}

export function useWithSplitPaneState(props: UseWithSplitPaneProps): WithSplitPaneState {
    const {container} = props;
    const [tooltipHeight, setTooltipHeight] = React.useState(0);
    const [split, setSplit] = React.useState<SplitLayoutType>(getInitialSplit());
    const [size, setSize] = React.useState(getInitialSize(split));
    const allowResize = split === SplitLayout.HORIZONTAL;
    let maxSize: number | undefined;
    let minSize: number | undefined;

    if (IS_WINDOW_AVAILABLE && container && split === SplitLayout.HORIZONTAL) {
        const containerHeight = container.getBoundingClientRect().height;
        maxSize = containerHeight - RESIZER_HEIGHT - tooltipHeight;
        minSize = containerHeight / 3;
    }

    return {
        allowResize,
        maxSize,
        minSize,
        tooltipHeight,
        setTooltipHeight,
        split,
        setSplit,
        size,
        setSize,
    };
}
