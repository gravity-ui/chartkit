import React from 'react';

import {Chart} from '@gravity-ui/charts';
import type {ChartProps, ChartRef} from '@gravity-ui/charts';
import afterFrame from 'afterframe';

import {settings} from '../../../libs';
import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';
import {measurePerformance} from '../../../utils';

import {vaildateData} from './utils';
import {withSplitPane} from './withSplitPane/withSplitPane';

const ChartWithSplitPane = withSplitPane(Chart);

export const GravityChartsWidget = React.forwardRef<
    ChartKitWidgetRef | undefined,
    ChartKitProps<'gravity-charts'>
>(function GravityChartsWidget(props, forwardedRef) {
    const {data, tooltip, onLoad, onRender, onChartLoad} = props;
    vaildateData(props);
    const lang = settings.get('lang');
    const performanceMeasure = React.useRef<ReturnType<typeof measurePerformance> | null>(
        measurePerformance(),
    );
    const chartRef = React.useRef<ChartRef>(null);
    const [reflowFailure, setReflowFailure] = React.useState<{error: unknown}>();
    const ChartComponent = tooltip?.splitted ? ChartWithSplitPane : Chart;

    const handleReflowError = React.useCallback((error: unknown) => {
        // shortcut: Match lifecycle messages until charts exposes a cancellation error type.
        if (
            error instanceof Error &&
            [
                'Chart host is unavailable',
                'Chart host has zero size',
                'Chart is unmounted',
                'Chart unmounted before reflow completed',
            ].includes(error.message)
        ) {
            return;
        }
        setReflowFailure({error});
    }, []);

    const handleChartReady: NonNullable<ChartProps['onReady']> = React.useCallback(() => {
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
    }, [onRender, onLoad]);

    React.useImperativeHandle(
        forwardedRef,
        () => ({
            reflow(details) {
                const options =
                    details &&
                    typeof details === 'object' &&
                    'immediate' in details &&
                    typeof details.immediate === 'boolean'
                        ? {immediate: details.immediate}
                        : undefined;
                const completion = chartRef.current?.reflow(options);
                completion?.catch(handleReflowError);
                return completion;
            },
        }),
        [handleReflowError],
    );

    React.useLayoutEffect(() => {
        if (onChartLoad) {
            onChartLoad({});
        }
    }, [onChartLoad]);

    if (reflowFailure) {
        throw reflowFailure.error;
    }

    return (
        <ChartComponent
            ref={chartRef}
            data={data}
            lang={lang}
            onReady={handleChartReady}
            onReflowError={handleReflowError}
        />
    );
});

export default GravityChartsWidget;
