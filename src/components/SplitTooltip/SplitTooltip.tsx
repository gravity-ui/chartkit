import React from 'react';

import {useResizeObserver} from '@gravity-ui/uikit';

import {SplitLayout, StyledSplitPane} from '../SplitPane';
import type {SplitLayoutType} from '../SplitPane';

export const SPLIT_TOOLTIP_RESIZER_SIZE = 24;
export const SPLIT_TOOLTIP_MAIN_PANE_RATIO = 0.6;

export type SplitTooltipRenderProps = {
    layout: SplitLayoutType;
    size: number;
};

export type SplitTooltipProps = {
    renderMainPane: (props: SplitTooltipRenderProps) => React.ReactNode;
    renderTooltip: (props: SplitTooltipRenderProps) => React.ReactNode;
    tooltipVisible: boolean;
    onMainPaneSizeChange?: (size: number, layout: SplitLayoutType) => void;
    style?: React.CSSProperties;
    mainPaneStyle?: React.CSSProperties;
    tooltipPaneStyle?: React.CSSProperties;
};

type SplitTooltipContentProps = SplitTooltipProps & {
    containerHeight: number;
    containerWidth: number;
};

const hiddenResizerStyle = {display: 'none'};
const defaultTooltipPaneStyle = {overflow: 'auto'};

export function getSplitTooltipLayout(width: number, height: number): SplitLayoutType {
    return width > height ? SplitLayout.VERTICAL : SplitLayout.HORIZONTAL;
}

export function getSplitTooltipMainPaneSize({
    containerHeight,
    containerWidth,
    layout,
    tooltipHeight,
}: {
    containerHeight: number;
    containerWidth: number;
    layout: SplitLayoutType;
    tooltipHeight: number;
}) {
    if (layout === SplitLayout.VERTICAL) {
        return containerWidth * SPLIT_TOOLTIP_MAIN_PANE_RATIO;
    }

    return Math.max(0, containerHeight - SPLIT_TOOLTIP_RESIZER_SIZE - tooltipHeight);
}

export function getSplitTooltipSizeLimits(containerHeight: number, tooltipHeight: number) {
    const maxSize = getSplitTooltipMainPaneSize({
        containerHeight,
        containerWidth: 0,
        layout: SplitLayout.HORIZONTAL,
        tooltipHeight,
    });

    return {
        minSize: Math.min(containerHeight / 3, maxSize),
        maxSize,
    };
}

function SplitTooltipContent(props: SplitTooltipContentProps) {
    const {
        containerHeight,
        containerWidth,
        renderMainPane,
        renderTooltip,
        tooltipVisible,
        onMainPaneSizeChange,
        style,
        mainPaneStyle,
        tooltipPaneStyle,
    } = props;
    const tooltipRef = React.useRef<HTMLDivElement | null>(null);
    const layout = getSplitTooltipLayout(containerWidth, containerHeight);
    const [tooltipHeight, setTooltipHeight] = React.useState(0);
    const [size, setSize] = React.useState(() =>
        getSplitTooltipMainPaneSize({
            containerHeight,
            containerWidth,
            layout,
            tooltipHeight: 0,
        }),
    );
    const previousDimensionsRef = React.useRef({
        containerHeight,
        containerWidth,
        layout,
        tooltipHeight,
    });

    const handleTooltipResize = React.useCallback(() => {
        const nextTooltipHeight = tooltipRef.current?.getBoundingClientRect().height ?? 0;
        setTooltipHeight(nextTooltipHeight);
    }, []);

    useResizeObserver({
        ref: tooltipRef,
        onResize: handleTooltipResize,
    });

    React.useLayoutEffect(() => {
        const previousDimensions = previousDimensionsRef.current;
        previousDimensionsRef.current = {
            containerHeight,
            containerWidth,
            layout,
            tooltipHeight,
        };

        if (layout !== previousDimensions.layout || layout === SplitLayout.VERTICAL) {
            setSize(
                getSplitTooltipMainPaneSize({
                    containerHeight,
                    containerWidth,
                    layout,
                    tooltipHeight,
                }),
            );
            return;
        }

        const {maxSize: previousMaxSize} = getSplitTooltipSizeLimits(
            previousDimensions.containerHeight,
            previousDimensions.tooltipHeight,
        );
        const {minSize: nextMinSize, maxSize: nextMaxSize} = getSplitTooltipSizeLimits(
            containerHeight,
            tooltipHeight,
        );

        setSize((currentSize) => {
            if (currentSize === previousMaxSize) {
                return nextMaxSize;
            }

            return Math.max(nextMinSize, Math.min(nextMaxSize, currentSize));
        });
    }, [containerHeight, containerWidth, layout, tooltipHeight]);

    React.useLayoutEffect(() => {
        onMainPaneSizeChange?.(size, layout);
    }, [layout, onMainPaneSizeChange, size]);

    const allowResize = layout === SplitLayout.HORIZONTAL;
    const sizeLimits = getSplitTooltipSizeLimits(containerHeight, tooltipHeight);
    const maxSize = allowResize ? sizeLimits.maxSize : undefined;
    const minSize = allowResize ? sizeLimits.minSize : undefined;
    const renderProps = {layout, size};

    return (
        <StyledSplitPane
            allowResize={allowResize}
            maxSize={maxSize}
            minSize={minSize}
            size={size}
            split={layout}
            style={style}
            onChange={setSize}
            resizerStyle={tooltipVisible ? undefined : hiddenResizerStyle}
            paneOneRender={() => renderMainPane(renderProps)}
            paneTwoRender={() => <div ref={tooltipRef}>{renderTooltip(renderProps)}</div>}
            pane1Style={mainPaneStyle}
            pane2Style={{...defaultTooltipPaneStyle, ...tooltipPaneStyle}}
        />
    );
}

export function SplitTooltip(props: SplitTooltipProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = React.useState({height: 0, width: 0});

    const updateDimensions = React.useCallback(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        setDimensions({
            height: rect?.height ?? 0,
            width: rect?.width ?? 0,
        });
    }, []);

    useResizeObserver({
        ref: containerRef,
        onResize: updateDimensions,
    });

    React.useLayoutEffect(updateDimensions, [updateDimensions]);

    return (
        <div ref={containerRef} style={{position: 'relative', height: '100%'}}>
            {dimensions.height > 0 && dimensions.width > 0 ? (
                <SplitTooltipContent
                    {...props}
                    containerHeight={dimensions.height}
                    containerWidth={dimensions.width}
                />
            ) : null}
        </div>
    );
}
