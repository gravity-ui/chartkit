import React from 'react';

import {Chart, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';
import type {ChartData, ChartProps, ChartRef} from '@gravity-ui/charts';
import {getComponentName, useResizeObserver} from '@gravity-ui/uikit';
import isEmpty from 'lodash/isEmpty';

import {
    SplitLayout,
    StyledSplitPane,
    mapScreenOrientationTypeToSplitLayout,
} from '../../../../components/SplitPane';
import {IS_SCREEN_ORIENTATION_AVAILABLE, IS_WINDOW_AVAILABLE} from '../../../../constants';
import {usePrevious} from '../../../../hooks';
import {isScreenOrientationEventType} from '../../../../utils';

import {TooltipContent} from './TooltipContent';
import type {TooltipContentRef} from './TooltipContent';
import {RESIZER_HEIGHT, getVerticalSize, useWithSplitPaneState} from './useWithSplitPaneState';

const tooltipPaneStyles = {overflow: 'auto'};

type WithSplitPaneProps = {};

type PointerMoveHandler = NonNullable<
    NonNullable<NonNullable<ChartData['chart']>['events']>['pointermove']
>;

const SplitPaneContent = (
    props: ChartProps & {
        height: number;
        ChartComponent: typeof Chart;
    },
) => {
    const {data, height, ChartComponent, ...restProps} = props;
    const tooltipContainerRef = React.useRef<HTMLDivElement | null>(null);
    const chartRef = React.useRef<ChartRef>(null);
    const tooltipRef = React.useRef<TooltipContentRef>(null);
    const shouldShowTooltip = React.useRef<boolean>(false);
    const {
        allowResize,
        minSize,
        maxSize,
        tooltipHeight,
        split,
        size,
        setTooltipHeight,
        setSplit,
        setSize,
    } = useWithSplitPaneState({
        containerHeight: height,
    });
    const prevTooltipHeight = usePrevious(tooltipHeight);
    const prevSplit = usePrevious(split);

    if (prevSplit && split !== prevSplit && split === SplitLayout.VERTICAL) {
        setSize(getVerticalSize());
    } else if (
        split === SplitLayout.HORIZONTAL &&
        prevTooltipHeight === 0 &&
        tooltipHeight !== prevTooltipHeight
    ) {
        const containerHeight = height;
        if (containerHeight - RESIZER_HEIGHT === size) {
            setSize(containerHeight - RESIZER_HEIGHT - tooltipHeight);
            queueMicrotask(() => {
                chartRef.current?.reflow({immediate: true});
            });
        }
    }

    const handleTooltipContentResize = React.useCallback(() => {
        if (!tooltipContainerRef.current || split !== SplitLayout.HORIZONTAL) {
            return;
        }

        const nextTooltipHeight = tooltipContainerRef.current.getBoundingClientRect().height;
        setTooltipHeight(nextTooltipHeight);
    }, [setTooltipHeight, split]);

    useResizeObserver({
        ref: tooltipContainerRef,
        onResize: handleTooltipContentResize,
    });

    const headerFormat = React.useMemo(() => {
        return (
            data.tooltip?.headerFormat ??
            getDefaultTooltipHeaderFormat({
                seriesData: data.series.data,
                yAxes: data.yAxis,
                xAxis: data.xAxis,
            })
        );
    }, [data.tooltip?.headerFormat, data.series.data, data.yAxis, data.xAxis]);

    const resultData = React.useMemo(() => {
        const userPointerMoveHandler = data.chart?.events?.pointermove;
        const pointerMoveHandler: PointerMoveHandler = (pointerMoveData, event) => {
            if (!isEmpty(pointerMoveData?.hovered)) {
                shouldShowTooltip.current = true;
                tooltipRef.current?.redraw(pointerMoveData);
            }

            userPointerMoveHandler?.(pointerMoveData, event);
        };

        return {
            defaultState: {
                hoveredPosition: {x: 0, y: 0},
            },
            ...data,
            chart: {
                ...data.chart,
                events: {
                    ...data.chart?.events,
                    pointermove: pointerMoveHandler,
                },
            },
            tooltip: {
                ...data.tooltip,
                enabled: false,
            },
        } satisfies ChartData;
    }, [data]);

    const handleOrientationChange = React.useCallback(() => {
        const deviceWidth = window.innerWidth;
        const deviceHeight = window.innerHeight;
        const nextSplit =
            deviceWidth > deviceHeight ? SplitLayout.VERTICAL : SplitLayout.HORIZONTAL;
        setSplit(nextSplit);
    }, [setSplit]);

    const handleScreenOrientationChange = React.useCallback(
        (e: Event) => {
            const type = e.target && 'type' in e.target && e.target.type;

            if (!isScreenOrientationEventType(type)) {
                return;
            }

            setSplit(mapScreenOrientationTypeToSplitLayout(type));
        },
        [setSplit],
    );

    const handleSizeChange = React.useCallback(
        (nextSize: number) => {
            chartRef.current?.reflow();

            if (split === SplitLayout.HORIZONTAL) {
                setSize(nextSize);
            }
        },
        [split, setSize],
    );

    React.useLayoutEffect(() => {
        if (IS_SCREEN_ORIENTATION_AVAILABLE) {
            screen.orientation.addEventListener('change', handleScreenOrientationChange);
        } else if (IS_WINDOW_AVAILABLE) {
            window.addEventListener('orientationchange', handleOrientationChange);
        }

        return () => {
            if (IS_SCREEN_ORIENTATION_AVAILABLE) {
                screen.orientation.removeEventListener('change', handleScreenOrientationChange);
            } else if (IS_WINDOW_AVAILABLE) {
                window.removeEventListener('orientationchange', handleOrientationChange);
            }
        };
    }, [handleOrientationChange, handleScreenOrientationChange]);

    return (
        <StyledSplitPane
            allowResize={allowResize}
            maxSize={maxSize}
            minSize={minSize}
            size={size}
            split={split}
            onChange={handleSizeChange}
            resizerStyle={shouldShowTooltip.current ? undefined : {display: 'none'}}
            paneOneRender={() => <ChartComponent {...restProps} ref={chartRef} data={resultData} />}
            paneTwoRender={() => (
                <div ref={tooltipContainerRef}>
                    <TooltipContent
                        ref={tooltipRef}
                        renderer={resultData.tooltip.renderer}
                        headerFormat={headerFormat}
                        valueFormat={resultData.tooltip.valueFormat}
                        rowRenderer={resultData.tooltip.rowRenderer}
                        totals={resultData.tooltip.totals}
                    />
                </div>
            )}
            pane2Style={tooltipPaneStyles}
        />
    );
};

export function withSplitPane(ChartComponent: typeof Chart) {
    const componentName = getComponentName(ChartComponent);
    const component = React.forwardRef<ChartRef, ChartProps & WithSplitPaneProps>(
        function WithSplitPaneComponent(props, _ref) {
            const containerRef = React.useRef<HTMLDivElement | null>(null);
            const [height, setHeight] = React.useState(0);

            React.useEffect(() => {
                if (containerRef.current) {
                    setHeight(containerRef.current.getBoundingClientRect().height ?? 0);
                }
            }, []);

            return (
                <div ref={containerRef} style={{position: 'relative', height: '100%'}}>
                    {height ? (
                        <SplitPaneContent
                            ChartComponent={ChartComponent}
                            {...props}
                            height={height}
                        />
                    ) : null}
                </div>
            );
        },
    );

    component.displayName = `withSplitPane(${componentName})`;

    return component;
}
