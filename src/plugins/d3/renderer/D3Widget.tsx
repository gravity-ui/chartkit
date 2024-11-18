import React from 'react';

import {Chart} from '@gravity-ui/charts';
import type {ChartProps, ChartRef} from '@gravity-ui/charts';
import afterFrame from 'afterframe';

import {settings} from '../../../libs';
import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';
import {measurePerformance} from '../../../utils';

import {withSplitPane} from './withSplitPane/withSplitPane';

const ChartWithSplitPane = withSplitPane(Chart);

const D3Widget = React.forwardRef<ChartKitWidgetRef | undefined, ChartKitProps<'d3'>>(
    function D3Widget(props, forwardedRef) {
        const {data, splitTooltip, onLoad, onRender, onChartLoad} = props;
        const lang = settings.get('lang');
        const performanceMeasure = React.useRef<ReturnType<typeof measurePerformance> | null>(
            measurePerformance(),
        );
        const chartRef = React.useRef<ChartRef>(null);
        const ChartComponent = splitTooltip?.enabled ? ChartWithSplitPane : Chart;

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

        return (
            <ChartComponent
                ref={chartRef}
                data={data}
                lang={lang}
                initialContent={splitTooltip?.initialContent}
                onResize={handleResize}
            />
        );
    },
);

export default D3Widget;
