import React from 'react';
import {select} from 'd3';
import debounce from 'lodash/debounce';
import type {DebouncedFunc} from 'lodash';

import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';
import {getChartPerformanceDuration, getRandomCKId, markChartPerformance} from '../../../utils';

import {Chart} from './components';

type ChartDimensions = {
    top: number;
    left: number;
    width: number;
    height: number;
};

const D3Widget = React.forwardRef<ChartKitWidgetRef | undefined, ChartKitProps<'d3'>>(
    function D3Widget(props, forwardedRef) {
        const {id, data, onRender} = props;
        const ref = React.useRef<HTMLDivElement>(null);
        const debounced = React.useRef<DebouncedFunc<() => void> | undefined>();
        const [dimensions, setDimensions] = React.useState<Partial<ChartDimensions>>();

        const chartId = React.useMemo(() => `${id}_${getRandomCKId()}`, [data, id]);

        React.useEffect(() => {
            markChartPerformance(chartId);
            const channel = new MessageChannel();

            channel.port1.onmessage = function () {
                if (onRender) {
                    onRender({renderTime: getChartPerformanceDuration(chartId)});
                }
            };

            requestAnimationFrame(function () {
                channel.port2.postMessage(undefined);
            });
        }, [chartId, onRender]);

        const handleResize = React.useCallback(() => {
            const parentElement = ref.current?.parentElement;

            if (parentElement) {
                const {top, left, width, height} = parentElement.getBoundingClientRect();
                setDimensions({top, left, width, height});
            }
        }, []);

        const debuncedHandleResize = React.useMemo(() => {
            debounced.current?.cancel();
            debounced.current = debounce(handleResize, 200);
            return debounced.current;
        }, [handleResize]);

        React.useImperativeHandle(
            forwardedRef,
            () => ({
                reflow() {
                    handleResize();
                },
            }),
            [handleResize],
        );

        React.useEffect(() => {
            const selection = select(window);
            // https://github.com/d3/d3-selection/blob/main/README.md#handling-events
            const eventName = `resize.${getRandomCKId()}`;
            selection.on(eventName, debuncedHandleResize);

            return () => {
                // https://d3js.org/d3-selection/events#selection_on
                selection.on(eventName, null);
            };
        }, [debuncedHandleResize]);

        React.useEffect(() => {
            // dimensions initialize
            handleResize();
        }, [handleResize]);

        return (
            <div
                ref={ref}
                style={{
                    width: dimensions?.width || '100%',
                    height: dimensions?.height || '100%',
                    position: 'relative',
                }}
            >
                {dimensions?.width && dimensions?.height && (
                    <Chart
                        top={dimensions?.top || 0}
                        left={dimensions.left || 0}
                        width={dimensions.width}
                        height={dimensions.height}
                        data={data}
                    />
                )}
            </div>
        );
    },
);

export default D3Widget;
