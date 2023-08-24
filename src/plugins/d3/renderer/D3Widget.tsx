import React from 'react';
import {select} from 'd3';
import debounce from 'lodash/debounce';
import type {DebouncedFunc} from 'lodash';

import type {ChartKitProps, ChartKitWidgetRef} from '../../../types';

import {Chart} from './components';

type ChartDimensions = {
    top: number;
    left: number;
    width: number;
    height: number;
};

const D3Widget = React.forwardRef<ChartKitWidgetRef | undefined, ChartKitProps<'d3'>>(
    function D3Widget(props, forwardedRef) {
        const ref = React.useRef<HTMLDivElement>(null);
        const debounced = React.useRef<DebouncedFunc<() => void> | undefined>();
        const [dimensions, setDimensions] = React.useState<Partial<ChartDimensions>>();

        const handleResize = React.useCallback(() => {
            if (ref.current) {
                const {top, left, width, height} = ref.current.getBoundingClientRect();
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
            selection.on('resize', debuncedHandleResize);

            return () => {
                // https://d3js.org/d3-selection/events#selection_on
                selection.on('resize', null);
            };
        }, [debuncedHandleResize]);

        React.useEffect(() => {
            // dimensions initialize
            handleResize();
        }, [handleResize]);

        return (
            <div ref={ref} style={{width: '100%', height: '100%', position: 'relative'}}>
                {dimensions?.width && dimensions?.height && (
                    <Chart
                        top={dimensions?.top || 0}
                        left={dimensions.left || 0}
                        width={dimensions.width}
                        height={dimensions.height}
                        data={props.data}
                    />
                )}
            </div>
        );
    },
);

export default D3Widget;
