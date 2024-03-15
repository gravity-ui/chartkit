import React from 'react';

import afterFrame from 'afterframe';
import {select} from 'd3';
import type {DebouncedFunc} from 'lodash';
import debounce from 'lodash/debounce';

import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';
import {getRandomCKId, measurePerformance} from '../../../utils';

import {Chart} from './components';
import {validateData} from './validation';

type ChartDimensions = {
    width: number;
    height: number;
};

const D3Widget = React.forwardRef<ChartKitWidgetRef | undefined, ChartKitProps<'d3'>>(
    function D3Widget(props, forwardedRef) {
        const {data, onLoad, onRender, onChartLoad} = props;
        const validatedData = React.useRef<typeof data>();
        const ref = React.useRef<HTMLDivElement>(null);
        const debounced = React.useRef<DebouncedFunc<() => void> | undefined>();
        const [dimensions, setDimensions] = React.useState<Partial<ChartDimensions>>();
        const performanceMeasure = React.useRef<ReturnType<typeof measurePerformance> | null>(
            measurePerformance(),
        );

        const handleResize = React.useCallback(() => {
            const parentElement = ref.current?.parentElement;

            if (parentElement) {
                const {width, height} = parentElement.getBoundingClientRect();
                setDimensions({width, height});
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
                    debuncedHandleResize();
                },
            }),
            [debuncedHandleResize],
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
            debuncedHandleResize();
        }, [debuncedHandleResize]);

        if (validatedData.current !== data) {
            validateData(data);
            validatedData.current = data;
        }

        React.useLayoutEffect(() => {
            if (onChartLoad) {
                onChartLoad({});
            }
        }, [onChartLoad]);

        React.useLayoutEffect(() => {
            if (dimensions?.width) {
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
            }
        }, [data, onRender, onLoad, dimensions]);

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
                    <Chart width={dimensions.width} height={dimensions.height} data={data} />
                )}
            </div>
        );
    },
);

export default D3Widget;
