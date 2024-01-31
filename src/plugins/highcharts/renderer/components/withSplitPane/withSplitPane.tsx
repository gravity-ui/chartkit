/* eslint callback-return: 0 */

import React from 'react';

import debounce from 'lodash/debounce';
import get from 'lodash/get';

import {getRandomCKId} from '../../../../../utils';
import {cn} from '../../../../../utils/cn';
import type {Highcharts} from '../../../types';
import {chartTypesWithoutCrosshair} from '../../helpers/config/config';
import {StyledSplitPane} from '../StyledSplitPane/StyledSplitPane';

import './WithSplitPane.scss';

const b = cn('with-split-pane');

const PANE_RESIZER_HEIGHT = 24;
const CHART_SECTION_PERCENTAGE = 0.6;
const MIN_TOOLTIP_SECTION_HEIGHT = 62;
const seriesTypesNeedsOnlyHoverState = ['line', 'area', 'arearange', 'bubble', 'map'];
const deviceWithNavBarHeight = window.innerHeight;

function getPointsForInitialRefresh(chart: Highcharts.Chart) {
    let minX = Infinity;
    let points = null;

    const type = get(chart, 'userOptions.chart.type');

    if (type === 'streamgraph') {
        points = chart.series[0].points[chart.series[0].points.length - 1];
    } else if (chart.series.length === 1) {
        const series = chart.series[0];
        const seriesType =
            (series && series.type) || (chart.options.chart && chart.options.chart.type);

        points =
            seriesType === 'sankey' || seriesType === 'map'
                ? chart.series[0].points[0]
                : [chart.series[0].points[0]];
    } else {
        points = chart.series
            .map((series) => {
                if (series.points[0]) {
                    minX = Math.min(minX, series.points[0].x);
                }

                return series.points[0];
            })
            .filter((point) => {
                return point && point.x === minX;
            });
    }

    return points;
}

function forceHoverState(
    chart: Highcharts.Chart,
    activePoints: Highcharts.Point | Highcharts.Point[],
) {
    const chartType = get(chart, 'userOptions.chart.type') || '';

    if (chartType === 'pie') {
        chart.tooltip.refresh(activePoints);
        chart.pointsForInitialRefresh = activePoints;
    } else if (chart.series?.length === 1) {
        const series = chart.series[0];
        const seriesType =
            (series && series.type) || (chart.options.chart && chart.options.chart.type);

        if (seriesType && seriesTypesNeedsOnlyHoverState.indexOf(seriesType)) {
            chart.series[0].points[0].setState('hover');
        } else {
            for (let i = chart.series[0].points.length - 1; i >= 0; i--) {
                chart.series[0].points[i].setState(i ? 'inactive' : 'hover');
            }
        }
    }

    if (chartTypesWithoutCrosshair.indexOf(chartType) === -1) {
        const point = Array.isArray(activePoints) ? activePoints[0] : activePoints;

        chart.xAxis?.[0].drawCrosshair(undefined, point);
        chart.yAxis?.[0].drawCrosshair(undefined, point);
    }
}

enum PaneSplits {
    VERTICAL = 'vertical',
    HORIZONTAL = 'horizontal',
}

type WithSplitPaneState = {
    paneSplit: PaneSplits;
    maxPaneSize: undefined | number;
    paneSize: undefined | number;
    /**
     * Chart component key.
     * Used to rerender chart after initializing and avoid bug with
     * [halo](https://api.highcharts.com/highcharts/series.pie.states.hover.halo) displaying.
     */
    componentKey: string;
};

export const withSplitPane = <ComposedComponentProps extends {}>(
    ComposedComponent: React.ComponentType<ComposedComponentProps>,
) => {
    type WrapperComponentProps = ComposedComponentProps & {
        onPaneChange?: () => void;
        onSplitPaneMountCallback?: (chart: Highcharts.Chart) => void;
    };

    type WrapperComponentPropsWithForwardedRef = WrapperComponentProps & {
        current: any;
        forwardedRef: React.Ref<ComposedComponentProps>;
    };

    class WithSplitPane extends React.PureComponent<
        WrapperComponentPropsWithForwardedRef,
        WithSplitPaneState
    > {
        debouncedHandlePaneChange: (size: number) => void;
        state: WithSplitPaneState = {
            paneSize: undefined,
            maxPaneSize: undefined,
            paneSplit:
                window.innerWidth > window.innerHeight
                    ? PaneSplits.VERTICAL
                    : PaneSplits.HORIZONTAL,
            componentKey: getRandomCKId(),
        };

        tooltipContainerRef = React.createRef<HTMLDivElement>();
        rootRef = React.createRef<HTMLDivElement>();

        constructor(props: WrapperComponentPropsWithForwardedRef) {
            super(props);

            this.debouncedHandlePaneChange = debounce(this.handlePaneChange, 500);
        }

        componentDidMount() {
            window.addEventListener('orientationchange', this.handleOrientationChange);

            // @ts-ignore
            if (!this.props.forwardedRef.current) {
                return;
            }

            if (this.props.onSplitPaneMountCallback) {
                // @ts-ignore
                this.props.onSplitPaneMountCallback(this.props.forwardedRef.current.chart);
            }

            this.setInitialState();
        }

        componentWillUnmount() {
            window.removeEventListener('orientationchange', this.handleOrientationChange);
        }

        render() {
            return (
                <div className={b()} ref={this.rootRef}>
                    {this.state.paneSplit === PaneSplits.VERTICAL
                        ? this.renderVertical()
                        : this.renderHorizontal()}
                </div>
            );
        }

        private setInitialState = (waitForFirstRedraw = false) => {
            // @ts-ignore
            if (!this.props.forwardedRef.current) {
                return;
            }

            // @ts-ignore
            const {chart} = this.props.forwardedRef.current;

            const points = getPointsForInitialRefresh(chart);

            chart.tooltip.refresh(points);
            chart.pointsForInitialRefresh = points;

            const callback = () => {
                forceHoverState(chart, points);
            };

            if (this.state.paneSplit === PaneSplits.HORIZONTAL) {
                this.setInitialPaneSize(callback);
            } else if (waitForFirstRedraw) {
                chart.afterRedrawCallback = callback;
            } else {
                callback();
            }
        };

        private afterCreateCallback = (chart: Highcharts.Chart) => {
            chart.tooltip.splitTooltip = true;
            chart.tooltip.getTooltipContainer = this.getTooltipContainer;
        };

        private setInitialPaneSize = (callback: () => void) => {
            if (!this.tooltipContainerRef.current || !this.rootRef.current) {
                return;
            }

            const tooltipContentHeight =
                this.tooltipContainerRef.current.getBoundingClientRect().height;
            const rootHeight = this.rootRef.current.getBoundingClientRect().height;
            const maxPaneSize = rootHeight - MIN_TOOLTIP_SECTION_HEIGHT;
            const currentDeviceHeight = window.innerHeight;

            const otherParticipantsHeight =
                PANE_RESIZER_HEIGHT + (currentDeviceHeight - deviceWithNavBarHeight) + 1;
            const paneSize = rootHeight - tooltipContentHeight - otherParticipantsHeight;

            this.setState(
                {
                    paneSize: paneSize > maxPaneSize ? maxPaneSize : paneSize,
                    maxPaneSize,
                    componentKey: getRandomCKId(),
                },
                () => {
                    this.reflow();
                    setTimeout(callback, 0);
                },
            );
        };

        private handleOrientationChange = () => {
            const handleResizeAfterOrientationChange = () => {
                const deviceWidth = window.innerWidth;
                const deviceHeight = window.innerHeight;

                this.setState(
                    {
                        paneSplit:
                            deviceWidth > deviceHeight
                                ? PaneSplits.VERTICAL
                                : PaneSplits.HORIZONTAL,
                    },
                    () => {
                        this.setInitialState(true);
                    },
                );

                window.removeEventListener('resize', handleResizeAfterOrientationChange);
            };

            window.addEventListener('resize', handleResizeAfterOrientationChange);
        };

        private reflow = () => {
            // @ts-ignore
            if (this.props.forwardedRef.current) {
                // @ts-ignore
                this.props.forwardedRef.current.chart.reflow();
            }
        };

        private handlePaneChange = (size: number) => {
            this.setState({paneSize: size});

            // @ts-ignore
            if (this.props.forwardedRef && this.props.forwardedRef.current) {
                if (this.props.onPaneChange) {
                    this.props.onPaneChange();
                }

                this.reflow();

                // @ts-ignore
                const {chart} = this.props.forwardedRef.current;

                if (chart && chart.pointsForInitialRefresh) {
                    const points = getPointsForInitialRefresh(chart);
                    forceHoverState(chart, points);
                }
            }
        };

        private getTooltipContainer = () => {
            return this.tooltipContainerRef.current;
        };

        private renderHorizontal() {
            const {paneSize, maxPaneSize, componentKey} = this.state;
            const thirdOfViewport = window.innerHeight / 3;

            return (
                <StyledSplitPane
                    split="horizontal"
                    onChange={this.debouncedHandlePaneChange}
                    minSize={thirdOfViewport}
                    maxSize={maxPaneSize || undefined}
                    size={paneSize}
                    paneOneRender={() => (
                        <ComposedComponent
                            {...this.props}
                            key={componentKey}
                            ref={this.props.forwardedRef}
                            callback={this.afterCreateCallback}
                        />
                    )}
                    paneTwoRender={() => <div ref={this.tooltipContainerRef} />}
                />
            );
        }

        private renderVertical() {
            const {componentKey} = this.state;
            const paneSize = window.innerWidth * CHART_SECTION_PERCENTAGE;

            return (
                <StyledSplitPane
                    split="vertical"
                    allowResize={false}
                    size={paneSize}
                    paneOneRender={() => (
                        <ComposedComponent
                            {...this.props}
                            key={componentKey}
                            ref={this.props.forwardedRef}
                            callback={this.afterCreateCallback}
                        />
                    )}
                    paneTwoRender={() => <div ref={this.tooltipContainerRef} />}
                />
            );
        }
    }

    return React.forwardRef<ComposedComponentProps, WrapperComponentPropsWithForwardedRef>(
        (props, ref) => {
            return <WithSplitPane {...props} forwardedRef={ref} />;
        },
    );
};
