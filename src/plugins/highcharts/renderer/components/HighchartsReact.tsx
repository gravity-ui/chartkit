import react, * as React from 'react';
import * as Highcharts from 'highcharts';

interface HighchartsReactRefObject {
    chart: Highcharts.Chart | null | undefined;
    container: React.RefObject<HTMLDivElement | undefined>;
}

interface HighchartsReactProps {
    [key: string]: any;
    allowChartUpdate?: boolean;
    constructorType?: keyof typeof Highcharts;
    containerProps?: {[key: string]: any};
    highcharts?: typeof Highcharts;
    immutable?: boolean;
    options?: Highcharts.Options;
    updateArgs?: [boolean] | [boolean, boolean] | [boolean, boolean, boolean];
    callback?: Highcharts.ChartCallbackFunction;
}

const useIsomorphicLayoutEffect =
    typeof window === 'undefined' ? react.useEffect : react.useLayoutEffect;

export const HighchartsReact: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<HighchartsReactProps> & React.RefAttributes<HighchartsReactRefObject>
> = react.memo(
    react.forwardRef(function HighchartsReact(props, ref) {
        const containerRef = react.useRef<HTMLDivElement>();
        const chartRef = react.useRef<Highcharts.Chart | null>();
        const constructorType = react.useRef(props.constructorType);
        const highcharts = react.useRef(props.highcharts);

        useIsomorphicLayoutEffect(() => {
            function createChart() {
                const {HighchartsComponent} = props;
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

            if (chartRef.current) {
                if (props.allowChartUpdate !== false) {
                    if (
                        props.constructorType !== constructorType.current ||
                        props.highcharts !== highcharts.current
                    ) {
                        constructorType.current = props.constructorType;
                        highcharts.current = props.highcharts;
                        createChart();
                    } else if (!props.immutable && chartRef.current) {
                        chartRef.current.update(
                            props.options,
                            ...(props.updateArgs || [true, true]),
                        );
                    } else {
                        createChart();
                    }
                }
            } else {
                createChart();
            }
        }, [props.options, props.allowChartUpdate, props.updateArgs, props.containerProps, props.highcharts, props.constructorType]);

        useIsomorphicLayoutEffect(() => {
            return () => {
                if (chartRef.current) {
                    chartRef.current.destroy();
                    chartRef.current = null;
                }
            };
        }, []);

        react.useImperativeHandle(
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

export default HighchartsReact;
