/* eslint no-console: ["error", { allow: ["warn", "error"]}] */

import React from 'react';
import Highcharts from 'highcharts';

interface HighchartsReactRefObject {
    chart: Highcharts.Chart | null | undefined;
    container: React.RefObject<HTMLDivElement | undefined>;
}

interface HighchartsReactProps {
    [key: string]: any;
    constructorType?: keyof typeof Highcharts;
    containerProps?: {[key: string]: any};
    highcharts?: typeof Highcharts;
    options: Highcharts.Options;
    callback?: Highcharts.ChartCallbackFunction;
}

const useIsomorphicLayoutEffect =
    typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export const HighchartsReact: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<HighchartsReactProps> & React.RefAttributes<HighchartsReactRefObject>
> = React.memo(
    React.forwardRef(function HighchartsReact(props: HighchartsReactProps, ref) {
        const containerRef = React.useRef<HTMLDivElement | null>(null);
        const chartRef = React.useRef<Highcharts.Chart | null>();

        useIsomorphicLayoutEffect(() => {
            function createChart() {
                const {highcharts: HighchartsComponent} = props;
                const constructorType = props.constructorType || 'chart';

                if (!HighchartsComponent) {
                    console.warn('The "highcharts" property was not passed.');
                } else if (!HighchartsComponent[constructorType]) {
                    console.warn(
                        'The "constructorType" property is incorrect or some ' +
                            'required module is not imported.',
                    );
                } else if (props.options) {
                    chartRef.current = HighchartsComponent[constructorType](
                        containerRef.current,
                        props.options,
                        props.callback,
                    );
                } else {
                    console.warn('The "options" property was not passed.');
                }
            }

            if (!chartRef.current) {
                createChart();
            }
        }, [props.options, props.allowChartUpdate, props.containerProps, props.highcharts, props.constructorType]);

        useIsomorphicLayoutEffect(() => {
            return () => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                }
            };
        }, []);

        React.useImperativeHandle(
            ref,
            () => ({
                get chart() {
                    return chartRef.current;
                },
                container: containerRef,
            }),
            [],
        );

        return <div {...props.containerProps} ref={containerRef} />;
    }),
);

HighchartsReact.displayName = 'HighchartsReact';

export default HighchartsReact;
