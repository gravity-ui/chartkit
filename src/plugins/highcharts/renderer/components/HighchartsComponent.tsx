import React from 'react';
import Highcharts, {ChartCallbackFunction, Options, Chart} from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import get from 'lodash/get';
import type {ChartKitProps} from '../../../../types';
import {settings} from '../../../../libs';
import {markChartPerformance, getChartPerformanceDuration, getRandomCKId} from '../../../../utils';
import type {HighchartsWidgetData, StringParams} from '../../types';
import {getGraph} from '../helpers/graph';
import {initHighchartsModules} from '../helpers/init-highcharts-modules';
import {withSplitPane} from './withSplitPane/withSplitPane';

import './HighchartsComponent.scss';

const HighcharsReactWithSplitPane = withSplitPane(HighchartsReact);

type Props = ChartKitProps<'highcharts'>;

type State = {
    prevData: HighchartsWidgetData | null;
    options: (Options & {useHighStock: boolean}) | null;
    callback: ChartCallbackFunction | null;
    isError: boolean;
};

initHighchartsModules();

export class HighchartsComponent extends React.PureComponent<Props, State> {
    static defaultProps: Partial<Props> = {
        hoistConfigError: true,
    };

    static getDerivedStateFromProps(nextProps: Props, prevState: State) {
        const isCurrentTooltipSplitted = get(prevState, 'options.tooltip.splitTooltip');
        const tooltipTypeWasChanged = isCurrentTooltipSplitted !== nextProps.splitTooltip;

        if (nextProps.data === prevState.prevData && !tooltipTypeWasChanged) {
            return null;
        }

        try {
            const {
                nonBodyScroll,
                data: {data, libraryConfig, config, comments},
                isMobile,
            } = nextProps;
            const entryId = get(nextProps, 'data.entryId');

            const configOptions = Object.assign(
                {
                    nonBodyScroll,
                    drillDownData: nextProps.data.config.drillDown,
                    splitTooltip: nextProps.splitTooltip,
                    highcharts: libraryConfig,
                    entryId,
                },
                config,
            );

            const {config: options, callback} = getGraph({
                options: configOptions,
                holidays: settings.get('extra')?.holidays,
                data,
                comments,
                isMobile,
            });

            return {
                prevData: nextProps.data,
                options,
                callback,
                isError: false,
            };
        } catch (error) {
            const {hoistConfigError, onError} = nextProps;

            if (onError && !hoistConfigError) {
                onError({error});
            }

            if (hoistConfigError) {
                throw error;
            }

            return {isError: true};
        }
    }

    state: State = {
        prevData: null,
        options: null,
        callback: null,
        isError: false,
    };

    private id?: string;

    private chartComponent = React.createRef<{
        chart: Highcharts.Chart;
        container: React.RefObject<HTMLDivElement>;
    }>();

    componentDidMount() {
        if (!this.props.onChartLoad) {
            this.onLoad();
            return;
        }

        const needCallbacks = !this.state.isError && !this.props.splitTooltip;
        if (!needCallbacks) {
            return;
        }
        const widget = this.chartComponent.current ? this.chartComponent.current.chart : null;

        if (this.state.callback && widget) {
            this.state.callback(widget);
        }

        this.props.onChartLoad?.({
            widget,
        });
    }

    componentDidUpdate() {
        const needRenderCallback =
            this.props.onRender && !this.state.isError && !this.props.splitTooltip;
        if (needRenderCallback) {
            this.props.onRender?.({
                renderTime: getChartPerformanceDuration(this.getId()),
            });
            return;
        }
        this.onLoad();
    }

    render() {
        const {isError, options} = this.state;
        const Component = this.props.splitTooltip ? HighcharsReactWithSplitPane : HighchartsReact;

        if (isError) {
            return null;
        }

        markChartPerformance(this.getId(true));

        return (
            <Component
                key={Math.random()}
                options={options}
                highcharts={Highcharts}
                onSplitPaneMountCallback={this.state.callback || undefined}
                callback={this.extendChartInstance}
                constructorType={options?.useHighStock ? 'stockChart' : 'chart'}
                containerProps={{className: 'chartkit-graph'}}
                ref={this.chartComponent}
            />
        );
    }

    reflow = () => {
        if (this.chartComponent.current) {
            this.chartComponent.current.chart.reflow();
        }
    };

    extendChartInstance = (chart: Chart) => {
        chart.updateParams = this.updateParams;
        chart.getParams = this.getParams;
    };

    getParams = () => {
        return this.props.data.params || {};
    };

    updateParams = (params: StringParams) => {
        if (this.props.onChange) {
            this.props.onChange(
                {type: 'PARAMS_CHANGED', data: {params}},
                {forceUpdate: true},
                true,
            );
        }
    };

    private getId(refresh = false) {
        if (refresh) {
            this.id = getRandomCKId();
        }
        return `${this.props.id}_${this.id}`;
    }

    private onLoad() {
        if (!this.state.isError && !this.props.splitTooltip) {
            const data = {
                widget: this.chartComponent.current ? this.chartComponent.current.chart : null,
                widgetData: this.state.options,
                loadedData: this.state.prevData,
            };

            if (this.state.callback && data.widget) {
                this.state.callback(data.widget);
            }

            const widgetRendering = getChartPerformanceDuration(this.getId());

            if (this.props.onLoad) {
                this.props.onLoad({widget: data.widget, widgetRendering});
            }

            window.requestAnimationFrame(this.reflow);
        }
    }
}
