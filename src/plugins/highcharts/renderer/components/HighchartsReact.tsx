import React from 'react';
import Highcharts from 'highcharts';

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
    options: Highcharts.Options;
    updateArgs?: [boolean] | [boolean, boolean] | [boolean, boolean, boolean];
    callback?: Highcharts.ChartCallbackFunction;
}

const useIsomorphicLayoutEffect =
    typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;

export const HighchartsReact: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<HighchartsReactProps> & React.RefAttributes<HighchartsReactRefObject>
    // eslint-disable-next-line react/display-name
> = React.memo(
    React.forwardRef(function HighchartsReact(props: HighchartsReactProps, ref) {
        const containerRef = React.useRef<HTMLDivElement | null>();
        const chartRef = React.useRef<Highcharts.Chart | null>();
        const constructorType = React.useRef(props.constructorType);
        const highcharts = React.useRef(props.highcharts);

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

        // @ts-ignore
        return <div {...props.containerProps} ref={containerRef} />;
    }),
);

export default HighchartsReact;
