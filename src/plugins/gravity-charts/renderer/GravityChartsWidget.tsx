import React from 'react';

import {Chart} from '@gravity-ui/charts';
import type {ChartProps, ChartRef} from '@gravity-ui/charts';
import afterFrame from 'afterframe';

import {settings} from '../../../libs';
import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';
import {measurePerformance} from '../../../utils';

import {withSplitPane} from './withSplitPane/withSplitPane';

const ChartWithSplitPane = withSplitPane(Chart);

export const GravityChartsWidget = React.forwardRef<
    ChartKitWidgetRef | undefined,
    ChartKitProps<'gravity-charts'>
>(function GravityChartsWidget(props, forwardedRef) {
    const {data, tooltip, onLoad, onRender, onChartLoad} = props;
    const lang = settings.get('lang');
    const performanceMeasure = React.useRef<ReturnType<typeof measurePerformance> | null>(
        measurePerformance(),
    );
    const chartRef = React.useRef<ChartRef>(null);
    const ChartComponent = tooltip?.splitted ? ChartWithSplitPane : Chart;

    const handleResize: NonNullable<ChartProps['onResize']> = React.useCallback(
        ({dimensions}) => {
            if (!dimensions) {
                return;
            }

            if (!performanceMeasure.current) {
                performanceMeasure.current = measurePerformance();
            }

            afterFrame(() => {
                const renderTime = performanceMeasure.current?.end();
                onRender?.({
                    renderTime,
                });
                onLoad?.({
                    widgetRendering: renderTime,
                });
                performanceMeasure.current = null;
            });
        },
        [onRender, onLoad],
    );

    React.useImperativeHandle(
        forwardedRef,
        () => ({
            reflow() {
                chartRef.current?.reflow();
            },
        }),
        [],
    );

    React.useLayoutEffect(() => {
        if (onChartLoad) {
            onChartLoad({});
        }
    }, [onChartLoad]);

    return <ChartComponent ref={chartRef} data={data} lang={lang} onResize={handleResize} />;
});

export default GravityChartsWidget;
