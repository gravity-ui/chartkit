import React from 'react';

import {Chart, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';
import type {ChartData, ChartProps, ChartRef} from '@gravity-ui/charts';
import {getComponentName} from '@gravity-ui/uikit';
import isEmpty from 'es-toolkit/compat/isEmpty';

import {SplitTooltip} from '../../../../components/SplitTooltip';

import {TooltipContent} from './TooltipContent';
import type {TooltipContentRef} from './TooltipContent';
import {useViewportSplitTooltipLayout} from './useViewportSplitTooltipLayout';

type WithSplitPaneProps = {
    onReflowError: (error: unknown) => void;
};

type PointerMoveHandler = NonNullable<
    NonNullable<NonNullable<ChartData['chart']>['events']>['pointermove']
>;

const SplitPaneContent = (
    props: ChartProps &
        WithSplitPaneProps & {
            ChartComponent: typeof Chart;
            forwardedRef: React.ForwardedRef<ChartRef>;
        },
) => {
    const {data, ChartComponent, forwardedRef, onReflowError, ...restProps} = props;
    const chartRef = React.useRef<ChartRef>(null);
    React.useImperativeHandle(
        forwardedRef,
        () => ({
            reflow: (options) => {
                if (chartRef.current) {
                    return chartRef.current.reflow(options);
                }
                const unavailable = Promise.reject<void>(new Error('Chart host is unavailable'));
                unavailable.catch(() => undefined);
                return unavailable;
            },
        }),
        [],
    );
    const tooltipRef = React.useRef<TooltipContentRef>(null);
    const [tooltipVisible, setTooltipVisible] = React.useState(false);
    const layout = useViewportSplitTooltipLayout();

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
                setTooltipVisible(true);
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

    return (
        <SplitTooltip
            layout={layout}
            resizerVisible={tooltipVisible}
            onMainPaneSizeChange={() => {
                chartRef.current?.reflow().catch(onReflowError);
            }}
            renderMainPane={() => (
                <ChartComponent {...restProps} ref={chartRef} data={resultData} />
            )}
            renderTooltip={() => (
                <TooltipContent
                    ref={tooltipRef}
                    renderer={resultData.tooltip.renderer}
                    headerFormat={headerFormat}
                    valueFormat={resultData.tooltip.valueFormat}
                    rowRenderer={resultData.tooltip.rowRenderer}
                    totals={resultData.tooltip.totals}
                    rows={resultData.tooltip.rows}
                />
            )}
        />
    );
};

export function withSplitPane(ChartComponent: typeof Chart) {
    const componentName = getComponentName(ChartComponent);
    const component = React.forwardRef<ChartRef, ChartProps & WithSplitPaneProps>(
        function WithSplitPaneComponent(props, ref) {
            return (
                <SplitPaneContent ChartComponent={ChartComponent} forwardedRef={ref} {...props} />
            );
        },
    );

    component.displayName = `withSplitPane(${componentName})`;

    return component;
}
