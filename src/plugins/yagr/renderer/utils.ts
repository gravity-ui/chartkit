import moment from 'moment';
import merge from 'lodash/merge';
import {defaults} from 'yagr';
import {settings} from '../../../libs';
import type {Yagr, YagrWidgetData, YagrTheme, YagrChartOptions, MinimalValidConfig} from '../types';
import {renderTooltip} from './tooltip';

const TOOLTIP_HEADER_CLASS_NAME = '_tooltip-header';
const TOOLTIP_LIST_CLASS_NAME = '_tooltip-list';

type ShapeYagrConfigArgs = {
    data: YagrWidgetData['data'];
    libraryConfig: YagrWidgetData['libraryConfig'];
    theme: YagrTheme;
};

export const synchronizeTooltipTablesCellsWidth = (tooltipContainer: HTMLElement) => {
    const tHeadNode = tooltipContainer.querySelector(`.${TOOLTIP_HEADER_CLASS_NAME}`);
    const tBodyNode = tooltipContainer.querySelector(`.${TOOLTIP_LIST_CLASS_NAME}`);

    if (!tHeadNode || !tBodyNode || !tHeadNode.children.length) {
        return;
    }

    const tHeadNodeFirstRow = tHeadNode.children[0];

    for (let j = 0; j < tHeadNodeFirstRow.children.length; j++) {
        const cell = tHeadNodeFirstRow.children[j];
        cell.removeAttribute('style');
        if (tBodyNode?.children.length === 1) {
            cell.innerHTML = '&nbsp;';
        }
    }

    const tBodyNodeFirstRow = tBodyNode.children[0];

    for (let j = 0; j < tBodyNodeFirstRow.children.length; j++) {
        const cell = tBodyNodeFirstRow.children[j];
        cell.removeAttribute('style');
    }

    const tHeadRowsWidth = tHeadNode.children[0].getBoundingClientRect().width;
    const tBodyRowsWidth = tBodyNode.children[0].getBoundingClientRect().width;

    const nodeWithWidesRows = tHeadRowsWidth > tBodyRowsWidth ? tHeadNode : tBodyNode;
    const nodeWithWidesRowsCellsWidth = Array.prototype.reduce.call(
        nodeWithWidesRows.children[0].children,
        (accum, cellNode) => {
            (accum as number[]).push(cellNode.getBoundingClientRect().width);
            return accum;
        },
        [],
    ) as number[];

    const nodeToSetCellsWidth = nodeWithWidesRows === tHeadNode ? tBodyNode : tHeadNode;
    const nodeToSetCellsWidthFirstRow = nodeToSetCellsWidth.children[0];

    for (let j = 0; j < nodeToSetCellsWidthFirstRow.children.length; j++) {
        const cell = nodeToSetCellsWidthFirstRow.children[j];
        cell.setAttribute('style', `width: ${nodeWithWidesRowsCellsWidth[j]}px`);
    }

    if (tBodyNode.children.length === 1) {
        for (const cell of tHeadNodeFirstRow.children) {
            cell.innerHTML = '';
        }
    }
};

export const checkFocus = (args: {tooltip: HTMLElement; yagr?: Yagr}) => (event: MouseEvent) => {
    const {tooltip, yagr} = args;

    if (!yagr) {
        return;
    }

    const target = event.target as HTMLElement | null;
    const seriesIdx =
        target && tooltip.contains(target) && target.tagName === 'TD'
            ? target.parentElement?.dataset['seriesIdx']
            : undefined;

    const serie = seriesIdx ? yagr.uplot.series[Number(seriesIdx)] : null;

    yagr.setFocus(serie ? serie.id : null, true);
};

export const detectClickOutside =
    (args: {
        tooltip: HTMLElement;
        actions: {
            pin: (state: boolean) => void;
            hide: () => void;
        };
        yagr?: Yagr;
    }) =>
    (event: MouseEvent) => {
        const {tooltip, actions, yagr} = args;

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

export const shapeYagrConfig = (args: ShapeYagrConfigArgs): MinimalValidConfig => {
    const {data, libraryConfig, theme} = args;
    const config: MinimalValidConfig = {
        ...libraryConfig,
        timeline: data.timeline,
        series: data.graphs,
    };

    const chart: YagrChartOptions = {
        appereance: {
            locale: settings.get('lang'),
            theme,
        },
    };

    merge(chart, config.chart);

    config.chart = chart;

    if (config.tooltip?.show) {
        config.tooltip = config.tooltip || {};
        config.tooltip.render = config.tooltip?.render || renderTooltip;

        if (!config.tooltip.className) {
            // "className" property prevent default yagr styles adding
            config.tooltip.className = 'chartkit-yagr-tooltip';
        }
    }

    config.axes = config.axes || {};
    const xAxis = config.axes[defaults.DEFAULT_X_SCALE];

    if (xAxis && !xAxis.values) {
        xAxis.values = getXAxisFormatter(config.chart.timeMultiplier);
    }

    if (!xAxis) {
        config.axes[defaults.DEFAULT_X_SCALE] = {
            values: getXAxisFormatter(config.chart.timeMultiplier),
        };
    }

    return config;
};
