import React from 'react';

import {Chart, getDefaultTooltipHeaderFormat} from '@gravity-ui/charts';
import type {ChartData, ChartProps, ChartRef} from '@gravity-ui/charts';
import {getComponentName} from '@gravity-ui/uikit';
import isEmpty from 'lodash/isEmpty';

import {SplitTooltip} from '../../../../components/SplitTooltip';

import {TooltipContent} from './TooltipContent';
import type {TooltipContentRef} from './TooltipContent';

type WithSplitPaneProps = {};

type PointerMoveHandler = NonNullable<
    NonNullable<NonNullable<ChartData['chart']>['events']>['pointermove']
>;

const SplitPaneContent = (props: ChartProps & {ChartComponent: typeof Chart}) => {
    const {data, ChartComponent, ...restProps} = props;
    const chartRef = React.useRef<ChartRef>(null);
    const tooltipRef = React.useRef<TooltipContentRef>(null);
    const [tooltipVisible, setTooltipVisible] = React.useState(false);

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
            resizerVisible={tooltipVisible}
            onMainPaneSizeChange={() => chartRef.current?.reflow()}
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
        function WithSplitPaneComponent(props, _ref) {
            return <SplitPaneContent ChartComponent={ChartComponent} {...props} />;
        },
    );

    component.displayName = `withSplitPane(${componentName})`;

    return component;
}
