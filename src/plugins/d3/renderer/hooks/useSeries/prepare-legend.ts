import clone from 'lodash/clone';
import get from 'lodash/get';
import merge from 'lodash/merge';
import {select} from 'd3';

import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import {legendDefaults} from '../../constants';
import {getHorisontalSvgTextHeight} from '../../utils';
import {getBoundsWidth} from '../useChartDimensions';
import type {PreparedAxis, PreparedChart} from '../useChartOptions/types';
import type {PreparedLegend, PreparedSeries, LegendConfig, LegendItem} from './types';

type LegendItemWithoutTextWidth = Omit<LegendItem, 'textWidth'>;

export const getPreparedLegend = (args: {
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series']['data'];
}): PreparedLegend => {
    const {legend, series} = args;
    const enabled = typeof legend?.enabled === 'boolean' ? legend?.enabled : series.length > 1;
    const defaultItemStyle = clone(legendDefaults.itemStyle);
    const itemStyle = get(legend, 'itemStyle');
    const computedItemStyle = merge(defaultItemStyle, itemStyle);
    const lineHeight = getHorisontalSvgTextHeight({text: 'Tmp', style: computedItemStyle});
    const height = enabled ? lineHeight : 0;

    return {
        align: get(legend, 'align', legendDefaults.align),
        enabled,
        height,
        itemDistance: get(legend, 'itemDistance', legendDefaults.itemDistance),
        itemStyle: computedItemStyle,
        lineHeight,
        margin: get(legend, 'margin', legendDefaults.margin),
    };
};

const getFlattenLegendItems = (series: PreparedSeries[]) => {
    return series.reduce<LegendItemWithoutTextWidth[]>((acc, s) => {
        const legendEnabled = get(s, 'legend.enabled', true);

        if (legendEnabled) {
            acc.push({
                ...s,
                symbol: s.legend.symbol,
            });
        }

        return acc;
    }, []);
};

const getGroupedLegendItems = (args: {
    maxLegendWidth: number;
    items: LegendItemWithoutTextWidth[];
    preparedLegend: PreparedLegend;
}) => {
    const {maxLegendWidth, items, preparedLegend} = args;
    const result: LegendItem[][] = [[]];
    let textWidthsInLine: number[] = [0];
    let lineIndex = 0;

    items.forEach((item) => {
        select(document.body)
            .append('text')
            .text(item.name)
            .style('font-size', preparedLegend.itemStyle.fontSize)
            .each(function () {
                const resultItem = clone(item) as LegendItem;
                const textWidth = this.getBoundingClientRect().width;
                resultItem.textWidth = textWidth;
                textWidthsInLine.push(textWidth);
                const textsWidth = textWidthsInLine.reduce((acc, width) => acc + width, 0);
                result[lineIndex].push(resultItem);
                const symbolsWidth = result[lineIndex].reduce((acc, {symbol}) => {
                    return acc + symbol.width + symbol.padding;
                }, 0);
                const distancesWidth = (result[lineIndex].length - 1) * preparedLegend.itemDistance;
                const isOverfilled = maxLegendWidth < textsWidth + symbolsWidth + distancesWidth;

                if (isOverfilled) {
                    result[lineIndex].pop();
                    lineIndex += 1;
                    textWidthsInLine = [textWidth];
                    const nextLineIndex = lineIndex;
                    result[nextLineIndex] = [];
                    result[nextLineIndex].push(resultItem);
                }
            })
            .remove();
    });

    return result;
};

export const getLegendComponents = (args: {
    chartWidth: number;
    chartHeight: number;
    chartMargin: PreparedChart['margin'];
    series: PreparedSeries[];
    preparedLegend: PreparedLegend;
    preparedYAxis: PreparedAxis[];
}) => {
    const {chartWidth, chartHeight, chartMargin, series, preparedLegend, preparedYAxis} = args;
    const maxLegendWidth = getBoundsWidth({chartWidth, chartMargin, preparedYAxis});
    const maxLegendHeight =
        (chartHeight - chartMargin.top - chartMargin.bottom - preparedLegend.margin) / 2;
    const flattenLegendItems = getFlattenLegendItems(series);
    const items = getGroupedLegendItems({
        maxLegendWidth,
        items: flattenLegendItems,
        preparedLegend,
    });
    let legendHeight = preparedLegend.lineHeight * items.length;
    let pagination: LegendConfig['pagination'] | undefined;

    if (maxLegendHeight < legendHeight) {
        const limit = Math.floor(maxLegendHeight / preparedLegend.lineHeight);
        const maxPage = Math.ceil(items.length / limit);
        pagination = {limit, maxPage};
        legendHeight = maxLegendHeight;
    }

    preparedLegend.height = legendHeight;
    const top =
        chartHeight - chartMargin.bottom - preparedLegend.height + preparedLegend.lineHeight / 2;
    const offset: LegendConfig['offset'] = {left: chartMargin.left, top};

    return {legendConfig: {offset, pagination}, legendItems: items};
};
