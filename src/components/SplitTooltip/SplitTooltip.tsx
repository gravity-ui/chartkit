import React from 'react';

import {useResizeObserver} from '@gravity-ui/uikit';

import {SplitLayout, StyledSplitPane} from '../SplitPane';
import type {SplitLayoutType} from '../SplitPane';

export const SPLIT_TOOLTIP_RESIZER_SIZE = 24;
export const SPLIT_TOOLTIP_MAIN_PANE_RATIO = 0.6;

export {SplitLayout as SplitTooltipLayout};
export type SplitTooltipLayout = SplitLayoutType;

export interface SplitTooltipRenderProps {
    /** The active pane layout. */
    layout: SplitTooltipLayout;
    /** The current size of the main pane in pixels. */
    size: number;
}

export interface SplitTooltipProps {
    /**
     * The controlled pane layout. When omitted, the layout is derived from the container size:
     * vertical when width is greater than height, horizontal otherwise.
     */
    layout?: SplitTooltipLayout;
    /** Additional styles for the main pane. */
    mainPaneStyle?: React.CSSProperties;
    /** Called after initialization and whenever the main pane size or layout changes. */
    onMainPaneSizeChange?: (size: number, layout: SplitTooltipLayout) => void;
    /** Renders the main pane with its current layout and size. */
    renderMainPane: (props: SplitTooltipRenderProps) => React.ReactNode;
    /** Renders the tooltip pane with the current main pane layout and size. */
    renderTooltip: (props: SplitTooltipRenderProps) => React.ReactNode;
    /** Controls the resizer visibility without hiding the tooltip pane. Defaults to `false`. */
    resizerVisible?: boolean;
    /** Additional styles for the split pane container. */
    style?: React.CSSProperties;
    /** Additional styles for the tooltip pane. */
    tooltipPaneStyle?: React.CSSProperties;
}

type SplitTooltipContentProps = SplitTooltipProps & {
    containerHeight: number;
    containerWidth: number;
};

const hiddenResizerStyle = {display: 'none'};
const defaultTooltipPaneStyle = {overflow: 'auto'};

export function getSplitTooltipLayout(
    width: number,
    height: number,
    layout?: SplitTooltipLayout,
): SplitTooltipLayout {
    return layout ?? (width > height ? SplitLayout.VERTICAL : SplitLayout.HORIZONTAL);
}

export function getSplitTooltipMainPaneSize({
    containerHeight,
    containerWidth,
    layout,
    tooltipHeight,
}: {
    containerHeight: number;
    containerWidth: number;
    layout: SplitTooltipLayout;
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

type SplitTooltipDimensions = {
    containerHeight: number;
    containerWidth: number;
    layout: SplitTooltipLayout;
    tooltipHeight: number;
};

function getNextMainPaneSize({
    currentSize,
    nextDimensions,
    previousDimensions,
}: {
    currentSize: number;
    nextDimensions: SplitTooltipDimensions;
    previousDimensions: SplitTooltipDimensions;
}) {
    if (
        nextDimensions.layout !== previousDimensions.layout ||
        nextDimensions.layout === SplitLayout.VERTICAL
    ) {
        return getSplitTooltipMainPaneSize(nextDimensions);
    }

    const {maxSize: previousMaxSize} = getSplitTooltipSizeLimits(
        previousDimensions.containerHeight,
        previousDimensions.tooltipHeight,
    );
    const {minSize: nextMinSize, maxSize: nextMaxSize} = getSplitTooltipSizeLimits(
        nextDimensions.containerHeight,
        nextDimensions.tooltipHeight,
    );

    if (currentSize === previousMaxSize) {
        return nextMaxSize;
    }

    return Math.max(nextMinSize, Math.min(nextMaxSize, currentSize));
}

function SplitTooltipContent(props: SplitTooltipContentProps) {
    const {
        containerHeight,
        containerWidth,
        renderMainPane,
        renderTooltip,
        layout: layoutProp,
        resizerVisible,
        onMainPaneSizeChange,
        style,
        mainPaneStyle,
        tooltipPaneStyle,
    } = props;
    const tooltipRef = React.useRef<HTMLDivElement | null>(null);
    const layout = getSplitTooltipLayout(containerWidth, containerHeight, layoutProp);
    const [tooltipHeight, setTooltipHeight] = React.useState(0);
    const [size, setSize] = React.useState(() =>
        getSplitTooltipMainPaneSize({
            containerHeight,
            containerWidth,
            layout,
            tooltipHeight: 0,
        }),
    );
    const dimensions = React.useMemo(
        () => ({
            containerHeight,
            containerWidth,
            layout,
            tooltipHeight,
        }),
        [containerHeight, containerWidth, layout, tooltipHeight],
    );
    const previousDimensionsRef = React.useRef(dimensions);
    const lastNotificationRef = React.useRef<{layout: SplitTooltipLayout; size: number} | null>(
        null,
    );
    const onMainPaneSizeChangeRef = React.useRef(onMainPaneSizeChange);
    onMainPaneSizeChangeRef.current = onMainPaneSizeChange;

    const handleTooltipResize = React.useCallback(() => {
        const nextTooltipHeight = tooltipRef.current?.getBoundingClientRect().height ?? 0;
        setTooltipHeight(nextTooltipHeight);
    }, []);

    useResizeObserver({
        ref: tooltipRef,
        onResize: handleTooltipResize,
    });

    const effectiveSize = getNextMainPaneSize({
        currentSize: size,
        nextDimensions: dimensions,
        previousDimensions: previousDimensionsRef.current,
    });

    React.useLayoutEffect(() => {
        previousDimensionsRef.current = dimensions;

        if (effectiveSize !== size) {
            setSize(effectiveSize);
        }
    }, [dimensions, effectiveSize, size]);

    React.useLayoutEffect(() => {
        const previousNotification = lastNotificationRef.current;

        if (
            previousNotification?.size === effectiveSize &&
            previousNotification.layout === layout
        ) {
            return undefined;
        }

        const callback = onMainPaneSizeChangeRef.current;
        if (!callback) {
            return undefined;
        }

        lastNotificationRef.current = {layout, size: effectiveSize};
        return callback(effectiveSize, layout);
    });

    const allowResize = layout === SplitLayout.HORIZONTAL;
    const sizeLimits = getSplitTooltipSizeLimits(containerHeight, tooltipHeight);
    const maxSize = allowResize ? sizeLimits.maxSize : undefined;
    const minSize = allowResize ? sizeLimits.minSize : undefined;
    const renderProps = {layout, size: effectiveSize};

    return (
        <StyledSplitPane
            allowResize={allowResize}
            maxSize={maxSize}
            minSize={minSize}
            size={effectiveSize}
            split={layout}
            style={style}
            onChange={setSize}
            resizerStyle={resizerVisible ? undefined : hiddenResizerStyle}
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
