import React from 'react';
import moment from 'moment';
import debounce from 'lodash/debounce';
import isEmpty from 'lodash/isEmpty';
import {useThemeType} from '@gravity-ui/uikit';
import YagrComponent, {YagrChartProps} from 'yagr/dist/react';
import {
    YagrConfig,
    TooltipRow,
    defaults,
    TooltipRenderOptions,
    ValueFormatter,
    MinimalValidConfig,
} from 'yagr';
import {i18n} from '../../../i18n';
import type {ChartKitWidgetRef, ChartKitProps} from '../../../types';
import {settings, CHARTKIT_ERROR_CODE, ChartKitError} from '../../../libs';
import {formatTooltip, TooltipData, TooltipLine} from './tooltip/tooltip';
import {synchronizeTooltipTablesCellsWidth} from './synchronizeTooltipTablesCellsWidth';

import './polyfills';

import './YagrWidget.scss';

type Props = ChartKitProps<'yagr'> & {id: string};

const calcOption = <T,>(d: T | {[key in string]: T} | undefined) => {
    return typeof d === 'object'
        ? Object.values(d).reduce((_, t) => {
              return t;
          })
        : d;
};

/*
 * Default tooltip renderer.
 * Adapter between native Yagr tooltip config and ChartKit
 * tooltip renderer.
 */
const renderTooltip = (data: TooltipRenderOptions) => {
    const cfg = data.yagr.config;
    const timeMultiplier = cfg.settings?.timeMultiplier || 1;
    const locale = cfg.settings?.locale;
    const opts = data.options;
    const {x, pinned} = data;

    let sumTotal = 0;
    const rows = Object.values(data.scales).reduce((acc, scale) => {
        sumTotal += scale.sum || 0;
        return acc.concat(scale.rows);
    }, [] as TooltipRow[]);

    const lines = rows.length;
    const sum = calcOption(opts.sum);

    const maxLines = calcOption<number>(opts.maxLines);
    const valueFormatter = calcOption<ValueFormatter>(opts.value);
    // eslint-disable-next-line no-nested-ternary
    const hiddenRowsNumber = pinned
        ? undefined
        : lines > maxLines
        ? Math.abs(maxLines - lines)
        : undefined;

    const hiddenRowsSum = hiddenRowsNumber
        ? valueFormatter(
              rows
                  .slice(-hiddenRowsNumber)
                  .reduce((sum, {originalValue}) => sum + (originalValue || 0), 0),
          )
        : undefined;

    const tooltipFormatOptions: TooltipData = {
        activeRowAlwaysFirstInTooltip: rows.length > 1,
        tooltipHeader: moment(x / timeMultiplier).format('DD MMMM YYYY HH:mm:ss'),
        shared: true,
        lines: rows.map(
            (row, i) =>
                ({
                    ...row,
                    seriesName: row.name || 'Serie ' + (i + 1),
                    seriesColor: row.color,
                    selectedSeries: row.active,
                    seriesIdx: row.seriesIdx,
                    percentValue:
                        typeof row.transformed === 'number' ? row.transformed.toFixed(1) : '',
                } as TooltipLine),
        ),
        withPercent: calcOption<boolean>(opts.percent),
        hiddenRowsNumber: hiddenRowsNumber as number,
        hiddenRowsSum,
    };

    if (sum) {
        tooltipFormatOptions.sum = valueFormatter(sumTotal);
    }

    return formatTooltip(tooltipFormatOptions, {
        options: {locale},
        lastVisibleRowIndex: pinned ? rows.length - 1 : maxLines - 1,
    } as any);
};

const getXAxisFormatter =
    (msm = 1) =>
    (_: unknown, ticks: number[]) => {
        const range = (ticks[ticks.length - 1] - ticks[0]) / msm;
        return ticks.map((rawValue) => {
            const d = moment(rawValue / msm);

            if (d.hour() === 0 && d.minutes() === 0 && d.seconds() === 0) {
                return d.format('DD.MM.YY');
            }

            return d.format(range < 300 ? 'HH:mm:ss' : 'HH:mm');
        });
    };

const YagrWidget = React.forwardRef<ChartKitWidgetRef | undefined, Props>((props, forwardedRef) => {
    const yagrRef = React.useRef<YagrComponent>(null);

    const {data, libraryConfig} = props.data;
    const {id, onLoad} = props;
    const theme = useThemeType() as YagrConfig['settings']['theme'];

    if (!data || isEmpty(data)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
            message: i18n('error', 'label_no-data'),
        });
    }

    const handlers: Record<string, null | ((event: MouseEvent) => void)> = {
        mouseMove: null,
        mouseDown: null,
    };

    const checkFocus = (tooltip: HTMLElement) => (event: MouseEvent) => {
        const yagr = yagrRef?.current?.chart;
        if (!yagr) {
            return;
        }

        const target = event.target as HTMLElement | null;
        const seriesIdx =
            target && tooltip.contains(target) && target.tagName === 'TD'
                ? target.parentElement?.dataset['seriesIdx']
                : undefined;

        const serie = seriesIdx ? yagr.uplot.series[Number(seriesIdx)] : null;

        yagr.focus(serie ? serie.id : null, true);
    };

    const detectClickOutside =
        (
            tooltip: HTMLElement,
            actions: {
                pin: (state: boolean) => void;
                hide: () => void;
            },
        ) =>
        (event: MouseEvent) => {
            const yagr = yagrRef?.current?.chart;
            if (!yagr) {
                return;
            }
            const target = event.target;

            if (target instanceof Element) {
                const isClickInsideTooltip = target && tooltip.contains(target);
                const isClickOnUplotOver =
                    target && yagr.root.querySelector('.u-over')?.contains(target);

                if (!isClickInsideTooltip && !isClickOnUplotOver) {
                    actions.pin(false);
                    actions.hide();
                }
            }
        };

    const config: Partial<YagrConfig> & MinimalValidConfig = {
        ...libraryConfig,
        timeline: data.timeline,
        series: data.graphs,
    };

    config.settings = {
        locale: settings.get('lang'),
        theme,
        ...(config.settings || {}),
    };

    if (config.tooltip?.enabled !== false) {
        config.tooltip = config.tooltip || {};
        config.tooltip.render = config.tooltip?.render || renderTooltip;
        // "className" property prevent default yagr styles adding
        config.tooltip.className = 'chartkit-yagr-tooltip';

        config.tooltip.onStateChange = (tooltip, {action, actions}) => {
            switch (action) {
                case 'pin': {
                    handlers.mouseMove = checkFocus(tooltip);
                    handlers.mouseDown = detectClickOutside(tooltip, actions);
                    document.addEventListener('mousemove', handlers.mouseMove);
                    document.addEventListener('mousedown', handlers.mouseDown);
                    break;
                }
                case 'unpin': {
                    if (handlers.mouseMove) {
                        document.removeEventListener('mousemove', handlers.mouseMove);
                        handlers.mouseMove = null;
                    }
                    if (handlers.mouseDown) {
                        document.removeEventListener('mousedown', handlers.mouseDown);
                        handlers.mouseDown = null;
                    }
                    break;
                }
                case 'render': {
                    synchronizeTooltipTablesCellsWidth(tooltip);
                }
            }
        };
    }

    config.axes = config.axes || {};
    const xAxis = config.axes[defaults.DEFAULT_X_SCALE];
    if (xAxis && !xAxis.values) {
        xAxis.values = getXAxisFormatter(config.settings.timeMultiplier);
    }

    if (!xAxis) {
        config.axes[defaults.DEFAULT_X_SCALE] = {
            values: getXAxisFormatter(config.settings.timeMultiplier),
        };
    }

    const debugFileName = props.data.sources
        ? Object.values(props.data.sources)
              .map((source) => {
                  return source?.data?.program;
              })
              .filter(Boolean)
              .join(', ') || id
        : id;

    const handleChartLoading: NonNullable<YagrChartProps['onChartLoad']> = React.useCallback(
        (chart, {renderTime}) => {
            onLoad?.({...data, widget: chart, widgetRendering: renderTime});
        },
        [onLoad, data],
    );

    const onWindowResize = React.useCallback(() => {
        if (yagrRef.current?.chart) {
            const chart = yagrRef.current.chart;
            const root = chart.root;
            const height = root.offsetHeight;
            const width = root.offsetWidth;
            chart.uplot.setSize({width, height});
            chart.uplot.redraw();
        }
    }, []);

    React.useImperativeHandle(
        forwardedRef,
        () => ({
            reflow() {
                onWindowResize();
            },
        }),
        [onWindowResize],
    );

    React.useEffect(() => {
        const debouncedOnWindowResize = debounce(onWindowResize, 50);
        window.addEventListener('resize', debouncedOnWindowResize);

        return () => {
            window.removeEventListener('resize', debouncedOnWindowResize);
        };
    }, [onWindowResize]);

    return (
        <YagrComponent
            ref={yagrRef}
            id={id}
            config={config}
            onChartLoad={handleChartLoading}
            debug={{filename: debugFileName}}
        />
    );
});

export default YagrWidget;
