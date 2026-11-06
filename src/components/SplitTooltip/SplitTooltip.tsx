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
    /** Whether to show the tooltip pane. Defaults to `true`. Disabling preserves the mounted main pane. */
    enabled?: boolean;
    /**
     * The controlled pane layout. When omitted, the layout is derived from the container size:
     * vertical when width is greater than height, horizontal otherwise.
     */
    layout?: SplitTooltipLayout;
    /** The share of the container width occupied by the main pane in vertical layout. Defaults to `0.6`. */
    mainPaneRatio?: number;
    /**
     * Minimum main pane height in pixels in horizontal layout. Does not apply in vertical layout.
     * Capped at half the height available after the resizer. When omitted, automatic sizing has no minimum.
     */
    minMainPaneSize?: number;
    /** Additional styles for the main pane. */
    mainPaneStyle?: React.CSSProperties;
    /** Called after initialization and whenever the main pane size or layout changes. */
    onMainPaneSizeChange?: (size: number, layout: SplitTooltipLayout) => void;
    /**
     * Preserves the manually selected horizontal main pane size across content, container and layout
     * changes, allowing the tooltip to shrink and scroll. Defaults to `false`.
     * Before the first drag, sizing follows the tooltip content in either mode.
     */
    preserveManualSize?: boolean;
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

/** The tooltip height together with the layout and container width it was measured in. */
type TooltipMeasurement = {
    height: number;
    layout: SplitTooltipLayout;
    containerWidth: number;
};

type ContainerDimensions = {height: number; width: number; initialized: boolean};

function getContainerDimensions(
    previous: ContainerDimensions,
    rect: {height: number; width: number} | undefined,
): ContainerDimensions {
    const height = rect?.height ?? 0;
    const width = rect?.width ?? 0;
    if (previous.height === height && previous.width === width) {
        return previous;
    }
    return {height, width, initialized: previous.initialized || (height > 0 && width > 0)};
}

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
    mainPaneRatio = SPLIT_TOOLTIP_MAIN_PANE_RATIO,
    minMainPaneSize,
    tooltipHeight,
}: {
    containerHeight: number;
    containerWidth: number;
    layout: SplitTooltipLayout;
    mainPaneRatio?: number;
    minMainPaneSize?: number;
    tooltipHeight: number;
}) {
    if (layout === SplitLayout.VERTICAL) {
        return containerWidth * mainPaneRatio;
    }

    const {minSize} = getSplitTooltipSizeLimits(containerHeight, tooltipHeight, minMainPaneSize);
    return Math.max(
        minMainPaneSize === undefined ? 0 : minSize,
        containerHeight - SPLIT_TOOLTIP_RESIZER_SIZE - tooltipHeight,
    );
}

export function getSplitTooltipSizeLimits(
    containerHeight: number,
    tooltipHeight: number,
    minMainPaneSize?: number,
    preserveManualSize = false,
) {
    const availableSize = Math.max(0, containerHeight - SPLIT_TOOLTIP_RESIZER_SIZE);
    const contentSize = Math.max(0, availableSize - tooltipHeight);
    const defaultMinSize = preserveManualSize ? 0 : Math.min(containerHeight / 3, contentSize);
    const minSize =
        minMainPaneSize === undefined
            ? defaultMinSize
            : Math.min(Math.max(0, minMainPaneSize), availableSize / 2);
    const maxSize = preserveManualSize ? availableSize : Math.max(minSize, contentSize);

    return {minSize, maxSize};
}

function SplitTooltipContent(props: SplitTooltipContentProps) {
    const {
        containerHeight,
        containerWidth,
        enabled = true,
        renderMainPane,
        renderTooltip,
        layout: layoutProp,
        mainPaneRatio = SPLIT_TOOLTIP_MAIN_PANE_RATIO,
        minMainPaneSize,
        preserveManualSize = false,
        resizerVisible,
        onMainPaneSizeChange,
        style,
        mainPaneStyle,
        tooltipPaneStyle,
    } = props;
    const tooltipRef = React.useRef<HTMLDivElement | null>(null);
    const layout = getSplitTooltipLayout(containerWidth, containerHeight, layoutProp);
    const [tooltipMeasurement, setTooltipMeasurement] = React.useState<TooltipMeasurement | null>(
        null,
    );
    const [userSize, setUserSize] = React.useState<number>();
    const lastNotificationRef = React.useRef<{layout: SplitTooltipLayout; size: number} | null>(
        null,
    );
    const onMainPaneSizeChangeRef = React.useRef(onMainPaneSizeChange);
    onMainPaneSizeChangeRef.current = onMainPaneSizeChange;

    // Updated after commit so that an interrupted render cannot tag a measurement with a
    // layout that never reached the DOM.
    const tooltipPaneRef = React.useRef({layout, containerWidth});
    React.useLayoutEffect(() => {
        tooltipPaneRef.current = {layout, containerWidth};
    }, [layout, containerWidth]);

    const handleTooltipResize = React.useCallback(() => {
        if (!enabled) {
            return;
        }

        const height = tooltipRef.current?.getBoundingClientRect().height ?? 0;
        const measuredIn = tooltipPaneRef.current;
        setTooltipMeasurement((previous) =>
            previous?.height === height &&
            previous.layout === measuredIn.layout &&
            previous.containerWidth === measuredIn.containerWidth
                ? previous
                : {height, ...measuredIn},
        );
    }, [enabled]);

    useResizeObserver({
        ref: tooltipRef,
        onResize: handleTooltipResize,
    });

    React.useLayoutEffect(handleTooltipResize, [handleTooltipResize, layout, containerWidth]);

    // Until the tooltip is re-measured in the current pane, size as if it were empty.
    const tooltipMeasured =
        !enabled ||
        layout === SplitLayout.VERTICAL ||
        (tooltipMeasurement?.layout === layout &&
            tooltipMeasurement.containerWidth === containerWidth);
    const tooltipHeight = tooltipMeasured ? tooltipMeasurement?.height ?? 0 : 0;

    const {minSize, maxSize} = getSplitTooltipSizeLimits(
        containerHeight,
        tooltipHeight,
        minMainPaneSize,
        preserveManualSize,
    );
    const automaticSize = getSplitTooltipMainPaneSize({
        containerHeight,
        containerWidth,
        layout,
        mainPaneRatio,
        minMainPaneSize,
        tooltipHeight,
    });
    const [size, setSize] = React.useState(automaticSize);
    const previousSizingRef = React.useRef({layout, maxSize});
    let effectiveSize = automaticSize;
    if (!enabled) {
        effectiveSize = layout === SplitLayout.HORIZONTAL ? containerHeight : containerWidth;
    } else if (layout === SplitLayout.HORIZONTAL) {
        if (preserveManualSize) {
            if (userSize !== undefined) {
                effectiveSize = Math.max(minSize, Math.min(maxSize, userSize));
            }
        } else if (previousSizingRef.current.layout === layout) {
            effectiveSize =
                size === previousSizingRef.current.maxSize
                    ? maxSize
                    : Math.max(minSize, Math.min(maxSize, size));
        }
    }

    React.useLayoutEffect(() => {
        if (enabled) {
            previousSizingRef.current = {layout, maxSize};
            if (effectiveSize !== size) {
                setSize(effectiveSize);
            }
        }
    }, [effectiveSize, enabled, layout, maxSize, size]);

    React.useLayoutEffect(() => {
        const previousNotification = lastNotificationRef.current;

        if (
            !tooltipMeasured ||
            (previousNotification?.size === effectiveSize && previousNotification.layout === layout)
        ) {
            return undefined;
        }

        const callback = onMainPaneSizeChangeRef.current;
        if (!callback) {
            return undefined;
        }

        lastNotificationRef.current = {layout, size: effectiveSize};
        callback(effectiveSize, layout);
        return undefined;
    });

    // SplitPane treats maxSize=0 as an offset from the container size, so disable dragging
    // when no space remains after the resizer.
    const allowResize =
        enabled && layout === SplitLayout.HORIZONTAL && containerWidth > 0 && maxSize > 0;
    const renderProps = {layout, size: effectiveSize};

    return (
        <StyledSplitPane
            allowResize={allowResize}
            maxSize={maxSize}
            minSize={minSize}
            size={effectiveSize}
            split={layout}
            style={style}
            onChange={preserveManualSize ? setUserSize : setSize}
            resizerStyle={enabled && resizerVisible ? undefined : hiddenResizerStyle}
            paneOneRender={() => renderMainPane(renderProps)}
            paneTwoRender={() => <div ref={tooltipRef}>{renderTooltip(renderProps)}</div>}
            pane1Style={mainPaneStyle}
            pane2Style={{
                ...defaultTooltipPaneStyle,
                ...((preserveManualSize || minMainPaneSize !== undefined) && {
                    minHeight: 0,
                    minWidth: 0,
                }),
                ...tooltipPaneStyle,
                ...(!enabled && {display: 'none'}),
            }}
        />
    );
}

export function SplitTooltip(props: SplitTooltipProps) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const [dimensions, setDimensions] = React.useState<ContainerDimensions>({
        height: 0,
        width: 0,
        initialized: false,
    });

    const updateDimensions = React.useCallback(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        setDimensions((previous) => getContainerDimensions(previous, rect));
    }, []);

    useResizeObserver({
        ref: containerRef,
        onResize: updateDimensions,
    });

    // A new layout usually comes with a new container size (a window resize event, or a parent
    // update) that ResizeObserver reports only later. Apply the layout together with the size
    // measured after the commit, so the content never sees it with the previous dimensions.
    const [appliedLayout, setAppliedLayout] = React.useState(props.layout);
    React.useLayoutEffect(() => {
        updateDimensions();
        setAppliedLayout(props.layout);
        // ResizeObserver only reports changes against the size it delivered last, so a size that
        // changes and reverts before the next frame is never reported. Re-measure in that frame
        // to stay in sync with it.
        const frame = requestAnimationFrame(updateDimensions);
        return () => cancelAnimationFrame(frame);
    }, [updateDimensions, props.layout]);

    return (
        <div ref={containerRef} style={{position: 'relative', height: '100%'}}>
            {dimensions.initialized ? (
                <SplitTooltipContent
                    {...props}
                    layout={appliedLayout}
                    containerHeight={dimensions.height}
                    containerWidth={dimensions.width}
                />
            ) : null}
        </div>
    );
}
