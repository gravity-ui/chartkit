/* eslint new-cap: 0, complexity: 0 */

import Highcharts from 'highcharts';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';
import get from 'lodash/get';
import clamp from 'lodash/clamp';
import isEmpty from 'lodash/isEmpty';
import isNumber from 'lodash/isNumber';
import throttle from 'lodash/throttle';
import pick from 'lodash/pick';
import debounce from 'lodash/debounce';
import {dateTime} from '@gravity-ui/date-utils';
import {i18n} from '../../../../../i18n';
import {formatNumber} from '../../../../shared';
import {block} from '../../../../../utils/cn';
import {
    getCommentsOnLine,
    drawComments,
    hideComments,
    drawOnlyRendererComments,
} from '../comments/drawing';
import formatTooltip, {
    TOOLTIP_ROW_CLASS_NAME,
    SERIES_NAME_DATA_ATTRIBUTE,
    TOOLTIP_HEADER_CLASS_NAME,
    TOOLTIP_LIST_CLASS_NAME,
    TOOLTIP_FOOTER_CLASS_NAME,
    TOOLTIP_CONTAINER_CLASS_NAME,
    TOOLTIP_ROW_NAME_CLASS_NANE,
} from '../tooltip';
import defaultOptions from './options';
import {
    calculatePrecision,
    isTooltipShared,
    isSafari,
    mergeArrayWithObject,
    concatStrings,
    buildNavigatorFallback,
    addShowInNavigatorToSeries,
    setNavigatorDefaultPeriod,
    numberFormat,
    getFormatOptionsFromLine,
    checkTooltipPinningAvailability,
    getSortedData,
} from './utils';
import {handleLegendItemClick} from './handleLegendItemClick';
import {getChartKitFormattedValue} from './utils/getChartKitFormattedValue';

const b = block('tooltip');
const TOOLTIP_OFFSET_FROM_CURSOR = 15;
const TOOLTIP_ROOT_CLASS_NAME = 'chartkit-highcharts-tooltip-container';
const MOBILE_TOOLTIP_OFFSET_FROM_POINTER = 30;
const CUSTOM_TYPES = {
    stack: {
        type: 'area',
        stacking: 'normal',
    },
    stacked_100p: {
        type: 'area',
        stacking: 'percent',
    },
    stacked_column: {
        type: 'column',
        stacking: 'normal',
    },
    stacked_column_100p: {
        type: 'column',
        stacking: 'percent',
    },
};

function formatNumberWrapper(line) {
    return formatNumber(line.originalValue, {
        precision: line.chartKitPrecision,
        prefix: line.chartKitPrefix,
        postfix: line.chartKitPostfix,
        format: line.chartKitFormat,
        showRankDelimiter: line.chartKitShowRankDelimiter,
        unit: line.chartKitUnit,
    });
}

function getFormattedValueWithSuffixAndPrefix(item) {
    const prefix = item.valuePrefix || '';
    const suffix = item.valueSuffix || '';

    // eslint-disable-next-line no-nested-ternary
    const formattedNumber = item.chartKitFormatting
        ? formatNumberWrapper(item)
        : item.valueDecimals && typeof item.value === 'number'
        ? item.value.toFixed(item.valueDecimals)
        : item.value;

    return `${prefix}${formattedNumber}${suffix}`;
}

function isZoomResetButtonClick(event, chartContainer) {
    let iterationIndex = 0;
    let element = event.composedPath()[iterationIndex];

    while (element) {
        if (element === chartContainer) {
            return false;
        } else if (element.classList.contains('highcharts-reset-zoom')) {
            return true;
        }

        element = event.composedPath()[++iterationIndex];
    }

    return false;
}

export function synchronizeTooltipTablesCellsWidth(tooltipContainer, isMobile) {
    const tHeadNode = tooltipContainer.querySelector(`.${TOOLTIP_HEADER_CLASS_NAME}`);
    const tBodyNode = tooltipContainer.querySelector(`.${TOOLTIP_LIST_CLASS_NAME}`);

    if (!tHeadNode || !tHeadNode.children.length) {
        return false;
    }

    const tHeadNodeFirstRow = tHeadNode.children[0];
    for (let j = 0; j < tHeadNodeFirstRow.children.length; j++) {
        const cell = tHeadNodeFirstRow.children[j];
        cell.removeAttribute('style');

        // Insert into cell some content to avoid Safari bad TD's width calculation
        if (tBodyNode.children.length === 1) {
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
            accum.push(cellNode.getBoundingClientRect().width);
            return accum;
        },
        [],
    );

    let tooltipOverflowsViewport = false;

    if (isMobile) {
        const containerWidth = tooltipContainer.getBoundingClientRect().width;
        const viewportWidth = window.screen.availWidth;
        const nameColumnWidth = nodeWithWidesRowsCellsWidth[1];

        if (containerWidth > viewportWidth) {
            tooltipOverflowsViewport = true;
            const diff = containerWidth - viewportWidth;
            const maxWidth = nameColumnWidth - diff;

            nodeWithWidesRowsCellsWidth[1] = maxWidth;
        }
    }

    const nodeToSetCellsWidth = nodeWithWidesRows === tHeadNode ? tBodyNode : tHeadNode;
    const nodeToSetCellsWidthFirstRow = nodeToSetCellsWidth.children[0];

    for (let j = 0; j < nodeToSetCellsWidthFirstRow.children.length; j++) {
        const cell = nodeToSetCellsWidthFirstRow.children[j];
        cell.setAttribute('style', `width: ${nodeWithWidesRowsCellsWidth[j]}px`);
    }

    if (isMobile && tooltipOverflowsViewport) {
        const rowNamesNodes = tooltipContainer.querySelectorAll(`.${TOOLTIP_ROW_NAME_CLASS_NANE}`);

        for (let i = 0; i < rowNamesNodes.length; i++) {
            const node = rowNamesNodes[i];

            node.setAttribute('style', `max-width: ${nodeWithWidesRowsCellsWidth[1]}px`);
        }
    }

    if (tBodyNode.children.length === 1) {
        for (const cell of tHeadNodeFirstRow.children) {
            cell.innerHTML = '';
        }
    }
}

const throttledAppendTooltip = throttle((container, tooltipMarkup) => {
    container.innerHTML = tooltipMarkup;
}, 500);

export function isNavigatorSerie(serie) {
    return serie.options.className === 'highcharts-navigator-series';
}

export function buildLegend(options) {
    // https://api.highcharts.com/highcharts/legend
    const legend = {
        alignColumns: false,
        labelFormatter: function () {
            if (this.userOptions?.formattedName) {
                // Other charts
                return this.userOptions.formattedName;
            } else if (this.formattedName) {
                // Pie chart
                return this.formattedName;
            } else {
                return this.name;
            }
        },
        navigation: {
            activeColor: 'var(--yc-color-base-special)',
            inactiveColor: 'var(--yc-color-base-generic-accent-disabled)',
            style: {color: 'var(--yc-color-text-primary)'},
        },
        title: {
            style: {color: 'var(--yc-color-text-secondary)'},
        },
    };

    if (options.outsideLegend) {
        options.legendPosition = null;
    }

    if (options.legendResetMargin || options.outsideLegend) {
        legend.y = 0;
        legend.x = 0;
    }

    if (
        typeof options.legendPosition === 'number' &&
        options.legendPosition >= 1 &&
        options.legendPosition <= 12
    ) {
        if (options.type !== 'map') {
            legend.layout = 'vertical';
        }

        legend.verticalAlign = 'middle';
        legend.backgroundColor = 'var(--highcharts-floating-bg)';
        legend.floating = true;

        switch (options.legendPosition) {
            case 1:
            case 2:
                legend.verticalAlign = 'top';
                legend.align = 'right';
                break;
            case 3:
                legend.verticalAlign = 'middle';
                legend.align = 'right';
                break;
            case 4:
            case 5:
                legend.verticalAlign = 'bottom';
                legend.align = 'right';
                break;
            case 6:
                legend.verticalAlign = 'bottom';
                legend.align = 'center';
                break;
            case 7:
            case 8:
                legend.verticalAlign = 'bottom';
                legend.align = 'left';
                break;
            case 9:
                legend.verticalAlign = 'middle';
                legend.align = 'left';
                break;
            case 10:
            case 11:
                legend.verticalAlign = 'top';
                legend.align = 'left';
                break;
            case 12:
                legend.verticalAlign = 'top';
                legend.align = 'center';
                break;
        }

        if (options.legendPosition >= 4 && options.legendPosition <= 8) {
            if (options.highstock) {
                legend.margin = -38;
                legend.y -= 110;
            } else {
                legend.y -= 50;
            }
        }

        if (options.legendPosition >= 7 && options.legendPosition <= 11) {
            legend.x = 45;
        }

        if (options.legendPosition === 4 || options.legendPosition === 8) {
            legend.y += -45;
        }
    }

    return legend;
}

export function hasChartVisibleSeries(chart) {
    return (
        chart &&
        Array.isArray(chart.series) &&
        chart.series
            .filter((serie) => serie.options.showInLegend !== false)
            .some((serie) => serie.visible)
    );
}

function buildNavigator(params, options) {
    const graphs = params.series;
    const navigatorSettings = options.navigatorSettings;
    const baseSeriesName = options.highstock.base_series_name || '';

    if (!navigatorSettings) {
        buildNavigatorFallback(graphs, baseSeriesName);
        return;
    }

    const linesMode = navigatorSettings.linesMode;
    const selectedLines = navigatorSettings.selectedLines;
    const graphNames = graphs.map((graph) => graph.legendTitle || graph.title || graph.name);
    const filteredSelectedLines = selectedLines.filter((line) => graphNames.includes(line));

    addShowInNavigatorToSeries({
        linesMode,
        selectedLines: filteredSelectedLines,
        params,
        graphs,
        baseSeriesName,
    });

    const periodSettings = navigatorSettings.periodSettings;

    setNavigatorDefaultPeriod({params, periodSettings});

    params.navigator.series = {
        ...options.highcharts.plotOptions.series,
        ...options.highcharts.plotOptions[options.highcharts.chart.type],
        type: options.highcharts.chart.type,
    };
}

function prepareZones(options) {
    const plotbands = [];
    const zonesColors = ['#FFD3C9', '#FFFFC9', '#C9FFCA', '#C4C6D4', '#D4C4D2'];

    for (let i = 0; i < options.zones.length; i++) {
        let nowColor = options.zones[i].color;
        if (!nowColor.length) {
            nowColor = zonesColors[i];
        }

        let nowFrom = options.zones[i].from;
        if (nowFrom === 'min') {
            nowFrom = -Infinity;
        }

        let nowTo = options.zones[i].to;
        if (nowTo === 'max') {
            nowTo = Infinity;
        }

        const nowzone = {
            color: nowColor,
            from: nowFrom,
            to: nowTo,
            label: {
                text: options.zones[i].text,
                textAlign: 'left',
                style: {
                    color: '#3E576F',
                    'font-size': '8pt',
                },
            },
        };

        plotbands.push(nowzone);
    }

    return plotbands;
}

function getTypeParams(data, options) {
    const params = {
        xAxis: {labels: {}},
        yAxis: {},
    };

    if (data.categories_ms) {
        params.xAxis.type = 'datetime';
        params.xAxis.labels.staggerLines = 1;
    } else {
        const flag = options.type === 'line' || options.type === 'area';
        params.xAxis.startOnTick = flag;
        params.xAxis.endOnTick = flag;

        if (data.categories) {
            params.xAxis.categories = data.categories;
        }
    }

    if (options.highstock) {
        params.xAxis.events = {};
        params.xAxis.events.afterSetExtremes = (e) => {
            const chart = e.target.chart;
            if (chart.userOptions.isCallbackCalled) {
                hideComments(chart, chart.userOptions._getComments(), chart.userOptions._config);
                drawComments(chart, chart.userOptions._getComments(), chart.userOptions._config);
            }
        };
    }

    if (options.zones) {
        params.yAxis.plotBands = prepareZones(options);
    }

    return params;
}

function getPrecision(point) {
    if (point.series.options && isNumber(point.series.options.precision)) {
        return point.series.options.precision;
    } else if (point.series.tooltipOptions && isNumber(point.series.tooltipOptions.valueDecimals)) {
        return point.series.tooltipOptions.valueDecimals;
    } else if (
        point.series.tooltipOptions &&
        isNumber(point.series.tooltipOptions.chartKitPrecision)
    ) {
        return point.series.tooltipOptions.chartKitPrecision;
    } else {
        return null;
    }
}

function callManageTooltipConfig(options, json, chart) {
    const initialTooltipHeaderValue = json.tooltipHeader;
    json.onlyDate = initialTooltipHeaderValue;

    const result = options.manageTooltipConfig(json, chart);

    if (
        result.onlyDate !== initialTooltipHeaderValue &&
        initialTooltipHeaderValue === result.tooltipHeader
    ) {
        json.tooltipHeader = result.onlyDate;
    }

    delete result.onlyDate;

    return result;
}

function validateCellManipulationConfig(tooltipOptions, property, item) {
    const values = Object.values(tooltipOptions[property]);
    const keys = Object.keys(tooltipOptions[property]);

    let errorMessage = `${i18n('chartkit', 'error-incorrect-key-value-intro')} "${property}"`;
    let isIncorrectFormat = false;

    if (keys.some(isNaN)) {
        errorMessage += i18n('chartkit', 'error-incorrect-key');
        isIncorrectFormat = true;
    }

    if (values.some((value) => typeof value !== 'string' && typeof value !== 'function')) {
        errorMessage += i18n('chartkit', 'error-incorrect-value');
        isIncorrectFormat = true;
    }

    if (isIncorrectFormat) {
        console.error(errorMessage);
    } else {
        item[property] = tooltipOptions[property];
    }
}

function getTooltip(tooltip, options, comments, holidays) {
    const serieType = (this.series && this.series.type) || tooltip.chart.options.chart.type;
    const chart = tooltip.chart;
    const xAxis = chart.xAxis[0];
    const isDatetimeXAxis = xAxis.options.type === 'datetime';
    let json;

    if (['pie', 'funnel', 'solidgauge', 'packedbubble'].includes(serieType)) {
        const dataSource = this.point || this.points[0].point;

        const precision = isNumber(options.tooltipPercentPrecision)
            ? options.tooltipPercentPrecision
            : 1;
        const percentage = numberFormat(dataSource.percentage, precision);

        const tooltipOptions = dataSource.series?.tooltipOptions || {};

        json = {
            lines: [
                {
                    value: numberFormat(
                        dataSource.y,
                        isNumber(options.precision) ? options.precision : 1,
                    ),
                    seriesColor: dataSource.color,
                    seriesName: dataSource.formattedName || dataSource.name,
                    originalValue: dataSource.y,
                    ...(options.showPercentInTooltip ? {percentValue: percentage} : null),
                    ...pick(tooltipOptions, [
                        'chartKitFormatting',
                        'chartKitPrecision',
                        'chartKitPrefix',
                        'chartKitPostfix',
                        'chartKitFormat',
                        'chartKitShowRankDelimiter',
                        'chartKitUnit',
                        'valuePrefix',
                        'valueSuffix',
                        'valueDecimals',
                    ]),
                },
            ],
            count: 1,
            shared: true,
            unsafe: Boolean(options.unsafe),
        };

        if (typeof options.manageTooltipConfig === 'function') {
            json = callManageTooltipConfig(options, json, chart);
        }

        const usersPointFormat = get(options.highcharts, 'tooltip.pointFormat');

        if (tooltipOptions.pointFormatter || usersPointFormat) {
            const formatter =
                tooltipOptions[(dataSource.formatPrefix || 'point') + 'Formatter'] ||
                dataSource.tooltipFormatter;

            const customRender = formatter.call(
                dataSource,
                usersPointFormat ||
                    tooltipOptions[(dataSource.formatPrefix || 'point') + 'Format'] ||
                    '',
            );

            json.lines[0].customRender = customRender;
        }

        if (!json.lines[0].customRender && tooltipOptions.insertCellAt) {
            validateCellManipulationConfig(tooltipOptions, 'insertCellAt', json.lines[0]);
        }

        if (!json.lines[0].customRender && tooltipOptions.replaceCellAt) {
            validateCellManipulationConfig(tooltipOptions, 'replaceCellAt', json.lines[0]);
        }

        json.lines[0].value = getFormattedValueWithSuffixAndPrefix(json.lines[0]);

        json.splitTooltip = options.splitTooltip;

        json.withPercent = (json.lines || []).some((line) => 'percentValue' in line);

        return formatTooltip(json, tooltip);
    }

    let points = [];
    let shared;

    if (this.points) {
        points = getSortedData(this.points, options?.tooltip?.sort);
        shared = true;
    } else {
        points.push(Object.assign({}, this.point));
        shared = false;
    }

    const extendedPoint = points.find(({x}) => x === this.x);

    const pointsCount = points.length;

    json = {
        this: this,
        useCompareFrom: options.useCompareFrom,
        pre_lines: [],
        lines: [],
        count: pointsCount,
        shared,
        withPercent: false,
        tooltipHeader: null,
        unsafe: Boolean(options.unsafe),
    };

    if (isDatetimeXAxis) {
        const items = this.points || Highcharts.splat(this);
        const highchartsScale = chart.userOptions._config.highchartsScale;

        let xDateFormat;

        if (tooltip.options.xDateFormat) {
            xDateFormat = tooltip.options.xDateFormat;
        } else if (highchartsScale) {
            xDateFormat = tooltip.options.dateTimeLabelFormats[highchartsScale];
        } else {
            xDateFormat = Highcharts.Tooltip.prototype.getXDateFormat.call(
                tooltip,
                items[0],
                tooltip.options,
                xAxis,
            );
        }

        json.tooltipHeader = chart.time.dateFormat(xDateFormat, this.x);
    } else if (
        extendedPoint?.point?.options?.xFormatted ??
        (extendedPoint?.x || extendedPoint?.x === 0)
    ) {
        const customTooltipHeaderFormatter = options?.highcharts?.tooltipHeaderFormatter;
        const tooltipHeaderStringValue = String(
            extendedPoint.point?.options?.xFormatted ?? extendedPoint.x,
        );

        json.tooltipHeader = customTooltipHeaderFormatter
            ? customTooltipHeaderFormatter(tooltipHeaderStringValue)
            : tooltipHeaderStringValue;
    }

    if (options.scale === 'd' && isDatetimeXAxis) {
        const pointTimestamp = Number(chart.time.dateFormat('%Y%m%d', this.x));
        const region = (options.region || 'TOT').toLowerCase();

        if (region !== 'tot') {
            json.region = region;
        }
        if (holidays?.holiday[region][pointTimestamp]) {
            json.holiday = true;
            json.holidayText = holidays.holiday[region][pointTimestamp];
        } else if (holidays?.weekend[region][pointTimestamp]) {
            json.weekend = true;
        }

        json.dayOfWeek = chart.time.dateFormat('%a', this.x);
    }

    let val = 0;
    let oldVal = 0;
    let maxPrecision = 0;
    let compareIndex;
    let compareValue;
    const legendArr = [];

    const newComments = getCommentsOnLine(this, comments, chart);
    json.xComments = newComments.xComments;

    points.forEach((point) => {
        const tooltipOptions = point.series.tooltipOptions || {};
        const userOptions = point.series.userOptions || {};

        const customTooltipSeriesName = point?.point?.custom?.tooltipPointName;

        const obj = {
            selectedSeries: point.series.index === chart.userOptions._activeSeries,
            hideSeriesName:
                options.highcharts &&
                options.highcharts.tooltip &&
                options.highcharts.tooltip.hideSeriesName,
            seriesColor: shared
                ? point.point.color || point.point.series.color
                : point.series.color,
            seriesShape: userOptions?.dashStyle,
            seriesName:
                customTooltipSeriesName ||
                point.series.userOptions?.formattedName ||
                point.series.name,
            ...pick(tooltipOptions, [
                'chartKitFormatting',
                'chartKitPrecision',
                'chartKitPrefix',
                'chartKitPostfix',
                'chartKitFormat',
                'chartKitShowRankDelimiter',
                'chartKitUnit',
                'valuePrefix',
                'valueSuffix',
                'valueDecimals',
            ]),
        };

        if (options.useCompareFrom) {
            if (!compareIndex) {
                point.series.data.forEach((item) => {
                    if (item.category == options.useCompareFrom) {
                        compareIndex = item.index;
                    }
                });
            }

            if (compareIndex) {
                compareValue = point.series.data[compareIndex].y;
                const diff = point.y - compareValue;

                obj.diff = numberFormat(diff, 2) !== '0' ? numberFormat(diff, 2) : '';
            }
        }

        const seriesIndex = point.series.index;
        legendArr.push([seriesIndex, seriesIndex]);

        let isVal = false;
        let originalValue;

        if (point.series.options.type === 'arearange') {
            isVal = true;
            obj.value = `${point.point.low} – ${point.point.high}`;
        } else if (point.y || point.y === 0) {
            originalValue = point.y;
            isVal = true;

            const precision = getPrecision(point);

            if (options.isPercent) {
                obj.value = numberFormat(
                    originalValue,
                    calculatePrecision(precision || 2, options),
                );
                const isNormalize = options.normalizeDiv || options.normalizeSub;
                obj.value = obj.value + (isNormalize ? '' : ' %');
            } else {
                obj.value = numberFormat(
                    originalValue,
                    calculatePrecision(precision, options, originalValue),
                );
            }

            const lastPoint = point.y.toString().split('.');
            if (lastPoint[1]) {
                maxPrecision = Math.max(
                    maxPrecision,
                    calculatePrecision(lastPoint[1].length, options),
                );
            }
        }

        obj.originalValue = originalValue;

        const useInSum =
            point.series.userOptions.useInSum == undefined
                ? true
                : point.series.userOptions.useInSum;
        if (options.enableSum && useInSum) {
            val += point.y;
        }

        oldVal += point.y;

        const serieId = point.series.userOptions.id || point.series.name;

        if (newComments.xyComments && serieId) {
            const xyComment = newComments.xyComments[serieId];

            if (xyComment) {
                obj.xyCommentText = xyComment.text;
            }
        }

        if (
            point.series.options.stacking === 'percent' ||
            (point.percentage !== undefined && options.showPercentInTooltip)
        ) {
            const precision = isNumber(options.tooltipPercentPrecision)
                ? options.tooltipPercentPrecision
                : 1;

            obj.percentValue = numberFormat(point.percentage, precision);
        }

        const {type} = point.series.options;

        const usersPointFormat = get(options.highcharts, 'tooltip.pointFormat');

        if (
            tooltipOptions.headerFormat &&
            obj.selectedSeries &&
            tooltipOptions.headerFormat !==
                defaultOptions.plotOptions.series.tooltip.headerFormat &&
            tooltipOptions.headerFormat !==
                get(defaultOptions.plotOptions[type], 'tooltip.headerFormat')
        ) {
            const headerString = tooltip.tooltipFooterHeaderFormatter(point.point.getLabelConfig());
            json.tooltipHeader = headerString;
        }

        if (
            tooltipOptions.pointFormatter ||
            usersPointFormat ||
            (tooltipOptions.pointFormat !== defaultOptions.tooltip.pointFormat &&
                tooltipOptions.pointFormat !==
                    defaultOptions.plotOptions.series.tooltip.pointFormat &&
                tooltipOptions.pointFormat !==
                    get(defaultOptions.plotOptions[type], 'tooltip.pointFormat'))
        ) {
            const formatter =
                tooltipOptions[(point.point.formatPrefix || 'point') + 'Formatter'] ||
                point.point.tooltipFormatter;

            const customRender = formatter.call(
                point.point,
                usersPointFormat ||
                    tooltipOptions[(point.point.formatPrefix || 'point') + 'Format'] ||
                    '',
            );

            obj.customRender = customRender;
        }

        if (!obj.customRender && tooltipOptions.insertCellAt) {
            validateCellManipulationConfig(tooltipOptions, 'insertCellAt', obj);
        }

        if (!obj.customRender && tooltipOptions.replaceCellAt) {
            validateCellManipulationConfig(tooltipOptions, 'replaceCellAt', obj);
        }

        if (isVal) {
            json.pre_lines.push(obj);
        }
    });

    for (let i = 0; i < legendArr.length; i++) {
        if (json.pre_lines[i]) {
            json.lines.push(json.pre_lines[i]);
        }
    }

    delete json.pre_lines;

    if (json.lines && json.lines.length > 0) {
        if (typeof options.manageTooltipConfig === 'function') {
            json = callManageTooltipConfig(options, json, chart);
        }

        let hiddenRowsSum = 0;
        let maxChartKitPrecision = null;

        for (let i = 0; i < json.lines.length; i++) {
            const item = json.lines[i];
            if (item.chartKitPrecision || item.chartKitPrecision === 0) {
                maxChartKitPrecision = Math.max(maxChartKitPrecision, item.chartKitPrecision);
            }

            item.value = getFormattedValueWithSuffixAndPrefix(item);

            if (tooltip.lastVisibleRowIndex && i > tooltip.lastVisibleRowIndex) {
                if (isNumber(item.originalValue)) {
                    hiddenRowsSum = hiddenRowsSum + item.originalValue;
                } else {
                    console.warn('originalValue is not defined for tooltip row');

                    hiddenRowsSum = NaN;

                    break;
                }
            }
        }

        maxPrecision = maxChartKitPrecision !== null ? maxChartKitPrecision : maxPrecision;

        if (pointsCount > 1) {
            const formatOptions = getFormatOptionsFromLine(json.lines[0]);

            if (
                options.enableSum == null && // eslint-disable-line eqeqeq, no-eq-null
                (options.stacking === 'normal' || options.stacking === 'percent' || options.sum)
            ) {
                json.sum = numberFormat(oldVal, maxPrecision, formatOptions);
            } else if (options.enableSum) {
                json.sum = numberFormat(val, maxPrecision, formatOptions);
            }
        }

        json.hiddenRowsNumber = json.count - tooltip.lastVisibleRowIndex - 1;

        if (isNaN(hiddenRowsSum)) {
            json.hiddenRowsSum = NaN;
        } else {
            let hiddenRowsSumAsString = '';

            if (options.isPercent) {
                hiddenRowsSumAsString = numberFormat(hiddenRowsSum, maxPrecision);
                const isNormalize = options.normalizeDiv || options.normalizeSub;
                hiddenRowsSumAsString = hiddenRowsSumAsString + (isNormalize ? '' : ' %');
            } else {
                hiddenRowsSumAsString = numberFormat(hiddenRowsSum, maxPrecision);
            }

            json.hiddenRowsSum = hiddenRowsSumAsString;
        }

        json.withPercent = (json.lines || []).some((line) => 'percentValue' in line);
        json.splitTooltip = options.splitTooltip;
        json.activeRowAlwaysFirstInTooltip = options.activeRowAlwaysFirstInTooltip;

        return formatTooltip(json, tooltip);
    } else {
        return false;
    }
}

function findXVal(xAxisVal, categoriesMs) {
    let xVal, min, max, leftDiff, rightDiff;

    categoriesMs.forEach((val, pos) => {
        if (pos > 0) {
            max = val - xAxisVal;
            min = xAxisVal - categoriesMs[pos - 1];

            if (
                (pos == 1 && xAxisVal < categoriesMs[pos]) ||
                (categoriesMs[pos - 1] <= xAxisVal && categoriesMs[pos] > xAxisVal) ||
                (pos == categoriesMs.length - 1 && xAxisVal > categoriesMs[pos])
            ) {
                max = categoriesMs[pos];
                min = categoriesMs[pos - 1];

                leftDiff = xAxisVal - min;
                rightDiff = max - xAxisVal;

                if (leftDiff >= rightDiff) {
                    xVal = max;
                } else {
                    xVal = min;
                }
            }
        }
    });

    return xVal;
}

function tooltipDiffClick(xVal, chart, options) {
    if (!xVal) {
        return;
    }

    function unCheck() {
        if (!options.useCompareFrom) {
            return false;
        }

        chart.xAxis[0].removePlotLine(options.useCompareFrom);
        options.useCompareFrom = undefined;
    }

    function check() {
        unCheck();

        const lineConfig = {
            value: xVal,
            width: 1,
            color: '#000000',
            id: xVal,
            zIndex: 20,
        };

        chart.xAxis[0].addPlotLine(lineConfig);
        options.useCompareFrom = xVal;
    }

    if (xVal && xVal !== options.useCompareFrom) {
        check();
    } else {
        unCheck();
    }
}

function getParamsByCustomType(type = 'line', options) {
    const customType = CUSTOM_TYPES[type];
    if (customType) {
        options.enableSum =
            options.enableSum === undefined || options.enableSum === null || options.enableSum;
        return {
            chart: {type: customType.type},
            plotOptions: {
                [customType.type]: {
                    stacking: customType.stacking,
                },
            },
        };
    }

    return {chart: {type}};
}

export function handleScroll() {
    if (!this.chart.container || this.isHidden) {
        return false;
    }

    const newTopPosition = this.chart.container.getBoundingClientRect().top;
    const diff = newTopPosition - this.chart.topPosition;

    this.chart.topPosition = newTopPosition;

    const currentTooltipTopPosition = this.now.y;
    const newTooltipTopPosition = currentTooltipTopPosition + diff;
    const tooltipHeight = this.container.getBoundingClientRect().height;
    const newTooltipBottomPosition =
        newTooltipTopPosition + tooltipHeight + this.options.padding * 2;

    if (newTooltipBottomPosition > window.innerHeight || newTooltipTopPosition < 0) {
        if (this.fixed) {
            this.hideFixedTooltip(this);
        } else {
            this.hide();
        }

        return false;
    }

    this.now.y = newTooltipTopPosition;
    this.container.style.top = `${newTooltipTopPosition}px`;
}

export function tooltipPositioner(tooltipWidth, tooltipHeight, point) {
    const tooltipPadding = this.options.padding;
    const windowHeight =
        window.innerHeight / ((window.visualViewport && window.visualViewport.scale) || 1);
    const containerDimensions = this.chart.container.parentElement.getBoundingClientRect();
    const pageScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    const pageScrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft;

    let cursorXPosition =
        containerDimensions.left + this.chart.plotLeft + point.plotX + pageScrollLeft;

    const tooltipOffset = TOOLTIP_OFFSET_FROM_CURSOR;

    const cursorYPosition =
        containerDimensions.top + this.chart.plotTop + point.plotY + pageScrollTop;
    const windowWidthAndScroll = window.innerWidth + pageScrollLeft;

    let tooltipTopPosition = cursorYPosition - tooltipHeight / 2;

    const isTooltipOnLeftNotFit = cursorXPosition - tooltipWidth - tooltipOffset < 0;
    const isTooltipOnRightNotFit =
        cursorXPosition + tooltipWidth + tooltipOffset + 2 * tooltipPadding >= windowWidthAndScroll;

    const isTooltipAboveCursor = isTooltipOnLeftNotFit && isTooltipOnRightNotFit;

    if (isTooltipAboveCursor) {
        cursorXPosition += tooltipWidth / 2;
        tooltipTopPosition -= tooltipHeight / 2;
    }

    if (tooltipTopPosition - pageScrollTop - tooltipPadding < 0) {
        tooltipTopPosition = pageScrollTop + tooltipPadding;
    }

    const tooltipBottomEdgePosition = tooltipTopPosition + tooltipHeight - pageScrollTop;

    if (tooltipBottomEdgePosition + tooltipPadding > windowHeight) {
        tooltipTopPosition = pageScrollTop + (windowHeight - tooltipHeight - tooltipPadding);
    }

    const tooltipOffsetFromCursor = tooltipOffset * (isTooltipOnRightNotFit ? -1 : 1);

    return {
        x: clamp(
            cursorXPosition + tooltipOffsetFromCursor - (isTooltipOnRightNotFit ? tooltipWidth : 0),
            tooltipPadding,
            window.innerWidth - tooltipWidth - 2 * tooltipPadding,
        ),
        y: clamp(tooltipTopPosition, pageScrollTop + tooltipPadding, Infinity),
    };
}

export function portraitOrientationTooltipPositioner(tooltipWidth, tooltipHeight, point) {
    const windowWidth = document.body.clientWidth;
    const containerDimensions = this.chart.container.parentElement.getBoundingClientRect();

    const cursorXPosition =
        containerDimensions.left + this.chart.plotLeft + point.plotX - tooltipWidth / 2;

    const pageScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
    const cursorYPosition =
        containerDimensions.top +
        this.chart.plotTop +
        pageScrollTop -
        tooltipHeight +
        point.plotY -
        MOBILE_TOOLTIP_OFFSET_FROM_POINTER;

    return {
        x: clamp(cursorXPosition, 0, windowWidth - tooltipWidth),
        y: clamp(cursorYPosition, 0, Infinity),
    };
}

export function getTooltipPositioner(isMobile) {
    return isMobile && window.innerHeight > window.innerWidth
        ? portraitOrientationTooltipPositioner
        : tooltipPositioner;
}

function handleClickOutside(event) {
    let node = event.target;

    while (this && node && node !== window.document.body) {
        if (node === this.container || (this.tooltip && node === this.tooltip.container)) {
            break;
        } else {
            node = node.parentElement;
        }
    }

    if (node === window.document.body) {
        this.tooltip.hideFixedTooltip();
        window.document.removeEventListener('click', this.tooltip.clickOutsideHandler);
    }
}

function handleTooltipItemMouseEnter(event) {
    if (event.target.classList.contains(TOOLTIP_ROW_CLASS_NAME)) {
        const seriesName = event.target.getAttribute(SERIES_NAME_DATA_ATTRIBUTE);
        const correspondingSeries = this.series.find((series) => series.name === seriesName);
        const correspondingSeriesIndex = this.series.indexOf(correspondingSeries);

        this.series.forEach((series, index) => {
            if (`${index}-${series.name}` === seriesName) {
                series.setState('hover');

                this.userOptions._activeSeries = correspondingSeriesIndex;

                const mouseLeaveHandler = (leaveHandlerEvent) => {
                    this.userOptions._activeSeries = null;

                    this.series.forEach((seriesItem) => {
                        seriesItem.setState('');
                    });

                    leaveHandlerEvent.target.removeEventListener('mouseleave', mouseLeaveHandler);
                };

                event.target.addEventListener('mouseleave', mouseLeaveHandler);
            } else {
                series.setState('inactive');
            }
        });
    }
}

export function hideFixedTooltip(tooltip, isMobile) {
    tooltip.fixed = false;
    tooltip.hide();

    if (Array.isArray(tooltip.pointsOnFixedTooltip)) {
        tooltip.pointsOnFixedTooltip.forEach((point) => {
            if (typeof point.setState === 'function') {
                point.setState('');
            }
        });
    } else {
        tooltip.pointsOnFixedTooltip.setState('');
    }

    tooltip.mouseEnterHandler = null;
    tooltip.pointsOnFixedTooltip = null;
    tooltip.seriesTypeOnFixedTooltip = null;

    const chartType = get(tooltip.chart.userOptions, 'chart.type');

    tooltip.update({
        positioner:
            chartType === 'timeline'
                ? tooltip.preFixationPositioner
                : getTooltipPositioner(isMobile),
        style: {
            ...tooltip.style,
            pointerEvents: 'none',
        },
    });

    window.document.removeEventListener('click', tooltip.clickOutsideHandler);

    if (tooltip.mouseEnterHandler) {
        tooltip.container.removeEventListener('mouseenter', tooltip.mouseEnterHandler);
    }
}

function fixTooltip(tooltip, options, event) {
    const availableToPin = checkTooltipPinningAvailability({
        tooltip: options.tooltip,
        altKey: event.altKey,
        metaKey: event.metaKey,
    });

    if (options.splitTooltip || (!availableToPin && !tooltip.fixed)) {
        return false;
    }

    if (tooltip.fixed) {
        hideFixedTooltip(tooltip);

        const serieType =
            (tooltip.series && tooltip.series.type) || tooltip.chart.options.chart.type;
        const pointsToRefreshTooltip =
            serieType === 'sankey' ? tooltip.chart.hoverPoint : tooltip.chart.hoverPoints;

        delete tooltip.preFixationHeight;

        tooltip.refresh(pointsToRefreshTooltip, event);
    } else {
        const serieType =
            (tooltip.series && tooltip.series.type) || tooltip.chart.options.chart.type;

        if (!tooltip.chart.hoverPoints || serieType === 'heatmap') {
            return false;
        }

        const hasInvisibleRows =
            tooltip.lastVisibleRowIndex &&
            tooltip.chart.hoverPoints.length > tooltip.lastVisibleRowIndex;

        let height = 0;
        let top = 0;

        if (hasInvisibleRows) {
            const tooltipNode = tooltip.container.querySelector(`.${TOOLTIP_CONTAINER_CLASS_NAME}`);
            const tooltipRect = tooltipNode.getBoundingClientRect();
            height = tooltipRect.height;
            top = tooltipRect.top;

            tooltip.preFixationHeight = height;
        }

        tooltip.lastVisibleRowIndex = undefined;
        tooltip.update({
            style: {
                ...tooltip.style,
                pointerEvents: 'auto',
            },
        });
        tooltip.seriesTypeOnFixedTooltip = get(tooltip, 'chart.hoverPoints[0].series.options.type');

        const pointsToRefreshTooltip =
            serieType === 'sankey' ? tooltip.chart.hoverPoint : tooltip.chart.hoverPoints;
        tooltip.refresh(pointsToRefreshTooltip, event, true);

        const {x, y} = tooltip.now;

        tooltip.preFixationPositioner = tooltip.positioner;

        tooltip.update({
            positioner: () => ({x, y}),
        });

        tooltip.refresh(pointsToRefreshTooltip, event, true);

        tooltip.clickOutsideHandler = handleClickOutside.bind(tooltip.chart);

        if (serieType !== 'timeline') {
            tooltip.mouseEnterHandler = handleTooltipItemMouseEnter.bind(tooltip.chart);
            tooltip.container.addEventListener('mouseenter', tooltip.mouseEnterHandler, true);
        }

        setTimeout(() => {
            window.document.addEventListener('click', tooltip.clickOutsideHandler);
        }, 0);

        tooltip.fixed = true;

        tooltip.pointsOnFixedTooltip = pointsToRefreshTooltip;

        if (hasInvisibleRows) {
            const footerNode = tooltip.container.querySelector(`.${TOOLTIP_FOOTER_CLASS_NAME}`);
            const listNode = tooltip.container.querySelector(`.${TOOLTIP_LIST_CLASS_NAME}`);
            const footerHeight = footerNode.getBoundingClientRect().height;
            const headerHeight = listNode.getBoundingClientRect().top - top;

            listNode.style.maxHeight = `${height - footerHeight - headerHeight - 1}px`;
            tooltip.container.style.maxHeight = `${height + tooltip.options.padding * 2}px`;

            const isScrollAppears = listNode.scrollHeight > listNode.clientHeight;

            if (!isScrollAppears) {
                return false;
            }

            const isScrollExtendContainerWidth = listNode.offsetWidth > listNode.clientWidth;

            if (isScrollExtendContainerWidth) {
                if (isSafari) {
                    tooltip.container
                        .querySelector(`div.${TOOLTIP_ROOT_CLASS_NAME}`)
                        .classList.add('_tooltip-with-scroll-in-safari');
                } else {
                    tooltip.container
                        .querySelector(`div.${TOOLTIP_ROOT_CLASS_NAME}`)
                        .classList.add('_tooltip-with-scroll');
                }
            }

            synchronizeTooltipTablesCellsWidth(tooltip.container);
        }
    }
}

const drillDownUpHandler = function () {
    if (this.tooltip && this.tooltip.fixed) {
        this.tooltip.hideFixedTooltip();
    }

    if (this.legend) {
        this.legend.destroy();
    }
};

export const chartTypesWithoutCrosshair = [
    'wordcloud',
    'funnel',
    'treemap',
    'variwide',
    'heatmap',
    'streamgraph',
    'xrange',
    'pie',
    'map',
    'sankey',
];

export const chartTypesWithoutYCrosshair = [
    'line',
    'area',
    'arearange',
    'bar',
    'boxplot',
    'column',
    'columnrange',
    'waterfall',
];

export const chartTypesWithNativeTooltip = [
    'scatter',
    'bubble',
    'sankey',
    'heatmap',
    'treemap',
    'networkgraph',
    'variwide',
    'waterfall',
    'streamgraph',
    'wordcloud',
    'xrange',
    'boxplot',
    'timeline',
];

function getCrosshairConfig(chartType, isCrosshairForYAxis = false) {
    if (isCrosshairForYAxis && chartTypesWithoutYCrosshair.indexOf(chartType) !== -1) {
        return false;
    }
    if (chartTypesWithoutCrosshair.indexOf(chartType) !== -1) {
        return false;
    } else {
        return {
            width: 2,
            color: '#a63eb2',
            zIndex: 10,
        };
    }
}

function drillOnClick(event, {options, chartType}) {
    const drillDownLevel = this.chart.getParams().drillDownLevel || ['0'];
    let filters = this.chart.getParams().drillDownFilters || [];

    if (!filters.some(Boolean)) {
        filters = new Array(options.drillDownData.breadcrumbs.length).fill('');
    }

    const isColorDrillDown = this.chart.getParams().isColorDrillDown;

    const level = Number(drillDownLevel[0]);

    if (level === options.drillDownData.breadcrumbs.length - 1) {
        return;
    }

    const drillDownFilters = filters.map((filter, index) => {
        if (level === index) {
            const point = event.point;
            const series = point.series;

            if (isColorDrillDown) {
                return series.name;
            }

            let drillDownFilter =
                point.options.drillDownFilterValue || point.category || point.name;

            const isDateTime =
                chartType !== 'pie' &&
                series.userOptions.type !== 'pie' &&
                series.xAxis.options.type === 'datetime';

            if (isDateTime) {
                drillDownFilter =
                    chartType === 'scatter' ? drillDownFilter - 180 * 60 * 1000 : drillDownFilter;
            }

            const dateTimeFormat = get(options.drillDownData, 'dateFormat', 'YYYY-MM-DD');
            const useUTC = get(series, 'chart.time.useUTC');
            const dateTimeOptions = useUTC ? {timeZone: 'UTC'} : {};

            return isDateTime
                ? dateTime({input: drillDownFilter, ...dateTimeOptions}).format(dateTimeFormat)
                : drillDownFilter;
        }

        return filter;
    });

    this.chart.updateParams({
        drillDownLevel: String(level + 1),
        drillDownFilters,
    });
}

function fixTooltipOnClick(event, {options}) {
    const customHandler =
        get(options, 'highcharts.plotOptions.series.events.click') ||
        get(options, 'highcharts.plotOptions.series.point.events.click');

    if (customHandler) {
        return false;
    }

    fixTooltip(this.chart.tooltip, options, event);
}

function adjustDonutFontSize(chart, chartSeries, innerWidth, totals) {
    if (!totals || isEmpty(chart) || isEmpty(chartSeries)) {
        return;
    }
    const MIN_ACCEPTABLE_INNER_SIZE = 400;
    const MAX_ACCEPTABLE_TOTALS_LENGTH = 9;

    let fontSize = 63;
    let padding = 35;

    if (totals.length > MAX_ACCEPTABLE_TOTALS_LENGTH) {
        fontSize = Math.round(fontSize * MAX_ACCEPTABLE_TOTALS_LENGTH) / totals.length;
    }
    if (innerWidth < MIN_ACCEPTABLE_INNER_SIZE) {
        fontSize = Math.round((innerWidth * fontSize) / MIN_ACCEPTABLE_INNER_SIZE);
        padding = Math.round((innerWidth * padding) / MIN_ACCEPTABLE_INNER_SIZE);
    }

    const x = chart.plotLeft + chartSeries.center[0];
    const y = chart.plotTop + chartSeries.center[1] + padding;

    if (chart.pieCenter) {
        chart.pieCenter.destroy();
    }

    chart.pieCenter = chart.renderer
        .text(totals, x, y, true)
        .css({
            'text-align': 'center',
            width: innerWidth - 2 * padding,
            fontSize: fontSize + 'px',
        })
        .add();
    const box = chart.pieCenter.getBBox();
    chart.pieCenter.attr({
        x: x - box.width / 2,
        y: y - box.height / 4,
    });
}

function formatDonutTotals(totals, formatSettings) {
    const parsedTotals = parseFloat(totals);
    if (isNaN(parsedTotals)) {
        return '';
    }

    if (formatSettings && formatSettings.chartKitFormatting) {
        const {
            chartKitPrecision,
            chartKitPrefix,
            chartKitPostfix,
            chartKitUnit,
            chartKitFormat,
            chartKitShowRankDelimiter,
        } = formatSettings;

        const options = {
            precision: chartKitPrecision,
            prefix: chartKitPrefix,
            postfix: chartKitPostfix,
            format: chartKitFormat,
            showRankDelimiter: chartKitShowRankDelimiter,
            unit: chartKitUnit,
        };

        return formatNumber(parsedTotals, options);
    }

    return `${parsedTotals}`;
}

export function prepareConfig(data, options, isMobile, holidays) {
    const series = data.graphs || data;
    const totals = formatDonutTotals(data?.totals, series[0].tooltip);
    const hasScatterSeries = series && series.some((item) => item.type === 'scatter');

    const chartType = get(options, 'highcharts.chart.type') || 'line';
    const {entryId} = options;
    const testClassName = `data-qa-chartkit-tooltip-entry-${entryId}`;
    const debouncedAdjustDonutFontSize = debounce(adjustDonutFontSize, 100);
    const params = merge(getParamsByCustomType(options.type, options), defaultOptions, {
        _config: options,
        chart: {
            events: {
                load: function () {
                    if (chartType === 'column' || chartType === 'bar') {
                        this.series.forEach((seriesItem) => {
                            const color = seriesItem.color;

                            // The update method updates all series, and therefore,
                            // after working out the handleLegendItemMouseOverAndOut,
                            // which updates only one specific series, you can get a bug
                            // of rendering bars when the min/max values are set to greater than 0:
                            // ┌───────────────────┐
                            // │Title1 │▒▒▒▒▒▒▒▒   │
                            // │Title2 │▒▒▒▒▒▒     │
                            // │Title3 │▒▒▒▒       │
                            // │       └────────── │
                            // └───────────────────┘
                            // ● Title1 ● Title2 ● Title3
                            //
                            // When hovering over the legend element Title1, we get the following:
                            // ┌───────────────────┐
                            // │Title1 │▒▒▒▒▒▒▒▒   │
                            // │▒▒▒▒▒▒▒│▒▒▒▒▒▒     │
                            // │▒▒▒▒▒▒▒│▒▒▒▒       │
                            // │       └────────── │
                            // └───────────────────┘
                            // ● Title1 ● Title2 ● Title3
                            seriesItem.update({color}, false);
                        });

                        // All series have chart property (it is a link on the same object)
                        // https://api.highcharts.com/class-reference/Highcharts.Series%23update#chart
                        // Call the redraw method on the chart, since we updated the series without redrawing
                        // https://api.highcharts.com/class-reference/Highcharts.Series%23update#update
                        this.series[0]?.chart.redraw();

                        this.series.forEach((serie) => {
                            if (!serie.legendItem) {
                                return;
                            }

                            const color = serie.color;

                            function handleLegendItemMouseOverAndOut() {
                                serie.update({
                                    color: Highcharts.Color(color).brighten(0.1).get('rgb'),
                                });
                                serie.legendItem.on('mouseout', () => {
                                    serie.update({
                                        color: Highcharts.Color(color).get('rgb'),
                                    });
                                    serie.legendItem.on(
                                        'mouseover',
                                        handleLegendItemMouseOverAndOut,
                                    );
                                });
                            }

                            serie.legendItem.on('mouseover', handleLegendItemMouseOverAndOut);
                        });
                    }
                },
                selection: function () {
                    if (this.tooltip.fixed) {
                        hideFixedTooltip(this.tooltip);
                    }
                },
                drilldown: drillDownUpHandler,
                drillup: drillDownUpHandler,
                click: options.showTooltipDiff
                    ? function (event) {
                          const xVal = findXVal(event.xAxis[0].value, data.categories_ms);
                          tooltipDiffClick(xVal, this, options);
                      }
                    : function (event) {
                          const customHandler = get(options, 'highcharts.chart.events.click');
                          const chartContainer = this.container;
                          const zoomResetButtonClickHappened = isZoomResetButtonClick(
                              event,
                              chartContainer,
                          );

                          if (zoomResetButtonClickHappened || customHandler) {
                              return false;
                          }
                          fixTooltip(this.tooltip, options, event);
                      },
                redraw: function () {
                    drawOnlyRendererComments(
                        this,
                        this.userOptions._getComments && this.userOptions._getComments(),
                        this.userOptions._config,
                    );
                },
                ...(chartType === 'pie' &&
                    totals && {
                        render: function () {
                            const chart = this;
                            const chartSeries = chart.series[0];
                            const innerWidth = chartSeries?.center[3];
                            if (innerWidth) {
                                debouncedAdjustDonutFontSize(
                                    chart,
                                    chartSeries,
                                    innerWidth,
                                    totals,
                                );
                            }
                        },
                    }),
            },
        },
        title: {
            text: options.hideTitle ? null : options.title,
            floating: options.titleFloating,
        },
        subtitle: {
            text: options.hideTitle ? null : options.subtitle,
        },
        series,
        legend:
            options.hideLegend === true || options.showLegend === false
                ? {enabled: false}
                : buildLegend(options),
        tooltip: {
            shared: isTooltipShared(chartType),
            splitTooltip: options.splitTooltip,
            distance: 0,
            style: {
                width: 'auto',
            },
            className: concatStrings(
                testClassName,
                TOOLTIP_ROOT_CLASS_NAME,
                'chartkit-theme_common',
                `${TOOLTIP_ROOT_CLASS_NAME}_type_${chartType}`,
            ),
            outside: chartType !== 'timeline',
            ...(chartType !== 'timeline' ? {positioner: getTooltipPositioner(isMobile)} : null),
            ...(options.insertCellAt ? {insertCellAt: options.insertCellAt} : null),
            ...(options.replaceCellAt ? {replaceCellAt: options.replaceCellAt} : null),
        },
        plotOptions: {
            xrange: {
                stickyTracking: false,
            },
            series: {
                events: {
                    legendItemClick: handleLegendItemClick,
                    mouseOver: function () {
                        this.chart.userOptions._activeSeries = this.index;
                    },
                    mouseOut: function () {
                        this.chart.userOptions._activeSeries = null;
                    },
                    click: function (event) {
                        if (options.drillDownData) {
                            drillOnClick.bind(this)(event, {options, chartType});
                        } else {
                            fixTooltipOnClick.bind(this)(event, {options});
                        }
                    },
                },
                point: {
                    events: {
                        click: function (event) {
                            if (event.shiftKey) {
                                this.series.chart.tooltip.hide();
                                this.series.data[this.index].remove();
                                return true;
                            }
                            return false;
                        },
                    },
                },
                marker: options.splitTooltip
                    ? {
                          states: {
                              hover: {
                                  enabled: false,
                              },
                              select: {
                                  enabled: false,
                              },
                          },
                      }
                    : {},
            },
            pie: {
                point: {
                    events: {
                        legendItemClick: handleLegendItemClick,
                    },
                },
            },
        },
        xAxis: {
            crosshair: options.splitTooltip
                ? getCrosshairConfig(hasScatterSeries ? 'scatter' : chartType)
                : false,
            labels: {
                formatter: function () {
                    const axis = this.axis;
                    const userOptions = this.chart.userOptions;
                    const highchartsScale = userOptions._config.highchartsScale;
                    /*
                     * axesFormatting - custom axis formatting
                     * axesFormatting - has 2 properties: yAxis и xAxis
                     * yAxis/xAxis - ChartKitFormatNumberSettings[]
                     * the position in the array corresponds to the axis index, each axis has an index field starting from 0
                     */
                    const xAxisFormatSettings = userOptions.axesFormatting?.xAxis;
                    const currentAxisIndex = this.axis.userOptions.index;

                    if (axis.options.type === 'datetime' && highchartsScale) {
                        const dateTimeLabelFormat =
                            axis.options.dateTimeLabelFormats[highchartsScale];
                        return this.chart.time.dateFormat(
                            dateTimeLabelFormat.main || dateTimeLabelFormat,
                            this.value,
                        );
                    } else if (
                        xAxisFormatSettings &&
                        xAxisFormatSettings[currentAxisIndex] &&
                        xAxisFormatSettings[currentAxisIndex].chartKitFormatting
                    ) {
                        return getChartKitFormattedValue(
                            xAxisFormatSettings[currentAxisIndex],
                            this.value,
                            this.percentage,
                        );
                    }

                    return Highcharts.Axis.prototype.defaultLabelFormatter.call(this);
                },
            },
            events: {
                setExtremes: function () {
                    // There is no better way to align zoom button text
                    // Callback setExtremes used because of it obligatory invocation on every zoom event
                    // setTimeout used because of absence resetZoomButton node in dom on first zoom event
                    setTimeout(() => {
                        const text = this.chart.resetZoomButton?.text;

                        if (text) {
                            text.translate(0, -6);
                        }
                    }, 0);
                },
            },
        },
        yAxis: {
            crosshair: options.splitTooltip
                ? getCrosshairConfig(hasScatterSeries ? 'scatter' : chartType, true)
                : false,
            labels: {
                formatter: function () {
                    const userOptions = this.chart.userOptions;
                    const yAxisFormatSettings = userOptions.axesFormatting?.yAxis;
                    const currentAxisIndex = this.axis.userOptions.index;

                    if (
                        yAxisFormatSettings &&
                        yAxisFormatSettings[currentAxisIndex] &&
                        yAxisFormatSettings[currentAxisIndex].chartKitFormatting
                    ) {
                        return getChartKitFormattedValue(
                            yAxisFormatSettings[currentAxisIndex],
                            this.value,
                            this.percentage,
                        );
                    }

                    return Highcharts.Axis.prototype.defaultLabelFormatter.call(this);
                },
            },
        },
        ...(options.highstock && options.highstock.range_min && options.highstock.range_max
            ? {
                  navigator: {
                      adaptToUpdatedData: false,
                  },
              }
            : null),
    });

    if (options.highcharts && options.highcharts.tooltip && options.highcharts.tooltip.formatter) {
        const formatter = options.highcharts.tooltip.formatter;
        params.tooltip.formatter = function (tooltip) {
            return `<div class="${b()}">${formatter.call(this, tooltip)}</div>`;
        };
        delete options.highcharts.tooltip.formatter;
    } else {
        params.tooltip.formatter = function (tooltip) {
            const serieType =
                tooltip.seriesTypeOnFixedTooltip ||
                get(tooltip, 'chart.hoverPoint.series.options.type') ||
                (this.series && this.series.type) ||
                tooltip.chart.options.chart.type;

            if (
                !options.manageTooltipConfig &&
                (chartTypesWithNativeTooltip.includes(serieType) ||
                    tooltip.chart.options.chart.polar ||
                    (this.points &&
                        this.points.some((point) =>
                            ['histogram', 'bellcurve', 'ohlc'].includes(point.series.type),
                        )))
            ) {
                const splitTooltip = tooltip.splitTooltip;

                const defaultFormatter = `<div class="${b({'split-tooltip': splitTooltip})}">
                    ${tooltip.defaultFormatter.call(this, tooltip).join('')}
                </div>`;

                if (splitTooltip) {
                    throttledAppendTooltip(tooltip.getTooltipContainer(), defaultFormatter);

                    return null;
                }

                return defaultFormatter;
            }

            const chartComments = tooltip.chart.userOptions._getComments();
            const tooltipRender = getTooltip.call(this, tooltip, options, chartComments, holidays);

            if (tooltip.splitTooltip) {
                throttledAppendTooltip(tooltip.getTooltipContainer(), tooltipRender);

                return null;
            }

            return tooltipRender;
        };
    }

    if (
        params.legend.enabled === undefined &&
        ['pie', 'heatmap', 'treemap'].indexOf(options.type) === -1 &&
        ['pie', 'heatmap', 'treemap'].indexOf(
            options.highcharts && options.highcharts.chart && options.highcharts.chart.type,
        ) === -1
    ) {
        params.legend.enabled = !options.splitTooltip && params.series.length > 1;
    }

    if (options.highstock) {
        params.useHighStock = true;

        buildNavigator(params, options);
    }

    if (options.hideHolidays && !options.highstock) {
        params.xAxis.ordinal = true;
        params.xAxis.startOnTick = true;
        params.xAxis.endOnTick = true;
        params.xAxis.showFirstLabel = false;
        params.xAxis.showLastLabel = false;
    }

    if (Array.isArray(options.hide_series)) {
        params.series.forEach((serie) => {
            if (options.hide_series.indexOf(serie.name) !== -1) {
                serie.visible = false;
            }
        });
    }

    const seriesDataLabelsFormatter = {
        dataLabels: options.highcharts?.plotOptions?.series?.dataLabels,
    };

    // If you set plotOptions.series.dataLabels.formatter, then it will not be applied in any way,
    // because according to the logic of Highcharts, its priority is lower than that of plotOptions.<chart_type>.dataLabels.formatter.
    // Therefore, we copy the settings from plotOptions.series into plotOptions.<chart_type>
    const preparedHighchartsOptions = merge(
        {},
        {
            plotOptions: {
                area: seriesDataLabelsFormatter,
                bar: seriesDataLabelsFormatter,
                column: seriesDataLabelsFormatter,
                line: seriesDataLabelsFormatter,
            },
        },
        options.highcharts,
    );

    mergeWith(params, getTypeParams(data, options), preparedHighchartsOptions, (a, b) => {
        if (typeof a === 'function' && typeof b === 'function' && a !== b) {
            return function (event, ...args) {
                a.call(this, event, ...args);

                if (!event || event.isTrusted !== false) {
                    return b.call(this, event, ...args);
                }
            };
        }

        return mergeArrayWithObject(a, b);
    });

    // https://github.com/highcharts/highcharts/issues/5671
    // http://jsfiddle.net/yo12kv0b/
    if (params.plotOptions.area && params.plotOptions.area.stacking === 'normal') {
        params.series.forEach((serie, serieIndex) => {
            if (serie.type === undefined) {
                let hasNegativeValues = false;
                let hasPositiveValues = false;

                serie.data.forEach((value) => {
                    let actualValue = value;
                    if (Array.isArray(value)) {
                        actualValue = value[1];
                    } else if (value && typeof value.y === 'number') {
                        actualValue = value.y;
                    }

                    if (actualValue > 0) {
                        hasPositiveValues = true;
                    } else if (actualValue < 0) {
                        hasNegativeValues = true;
                    }
                });

                const serieHasIntersectionWithOthers = params.series.some(
                    (serieItem, serieItemIndex) => {
                        if (serieItemIndex === serieIndex) {
                            return false;
                        } else {
                            const serieSet = new Set(serie.data.map((item) => item.x));
                            const serieItemIndexSet = new Set(serieItem.data.map((item) => item.x));

                            for (const item of serieSet) {
                                if (serieItemIndexSet.has(item)) {
                                    return true;
                                }
                            }

                            return false;
                        }
                    },
                    false,
                );

                if (serieHasIntersectionWithOthers && !hasPositiveValues && hasNegativeValues) {
                    serie.stack = serie.stack ? `${serie.stack}__negative` : 'negative';
                }
            }
        });
    }

    params.xAxis.calcClosestPointManually = Boolean(options.calcClosestPointManually);

    return params;
}
