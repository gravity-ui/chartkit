import get from 'lodash/get';
import {select} from 'd3';

import {block} from '../../../../../utils/cn';
import type {ChartKitWidgetData} from '../../../../../types/widget-data';

import {getBoundsWidth} from '../useChartDimensions';
import type {PreparedAxis, PreparedChart} from '../useChartOptions/types';
import type {PreparedLegend, PreparedSeries, LegendConfig, LegendItem} from './types';

const b = block('d3-legend');
const LEGEND_LINE_HEIGHT = 15;
const LEGEND_PADDING_TOP = 20;

export const getPreparedLegend = (args: {
    legend: ChartKitWidgetData['legend'];
    series: ChartKitWidgetData['series']['data'];
}): PreparedLegend => {
    const {legend, series} = args;
    const enabled = typeof legend?.enabled === 'boolean' ? legend?.enabled : series.length > 1;
    const height = enabled ? LEGEND_LINE_HEIGHT : 0;

    return {
        align: legend?.align || 'center',
        enabled,
        itemDistance: legend?.itemDistance || 20,
        height,
        lineHeight: LEGEND_LINE_HEIGHT,
        paddingTop: LEGEND_PADDING_TOP,
    };
};

const getFlattenLegendItems = (series: PreparedSeries[]) => {
    return series.reduce<LegendItem[]>((acc, s) => {
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
    boundsWidth: number;
    items: LegendItem[];
    preparedLegend: PreparedLegend;
}) => {
    const {boundsWidth, items, preparedLegend} = args;
    const result: LegendItem[][] = [[]];
    let textWidthsInLine: number[] = [0];
    let lineIndex = 0;

    items.forEach((item) => {
        select(document.body)
            .append('text')
            .text(item.name)
            .attr('class', b('item-text'))
            .each(function () {
                const textWidth = this.getBoundingClientRect().width;
                textWidthsInLine.push(textWidth);
                const textsWidth = textWidthsInLine.reduce((acc, width) => acc + width, 0);
                result[lineIndex].push(item);
                const symbolsWidth = result[lineIndex].reduce((acc, {symbol}) => {
                    return acc + symbol.width + symbol.padding;
                }, 0);
                const distancesWidth = (result[lineIndex].length - 1) * preparedLegend.itemDistance;
                const isOverfilled = boundsWidth < textsWidth + symbolsWidth + distancesWidth;

                if (isOverfilled) {
                    result[lineIndex].pop();
                    lineIndex += 1;
                    textWidthsInLine = [textWidth];
                    const nextLineIndex = lineIndex;
                    result[nextLineIndex] = [];
                    result[nextLineIndex].push(item);
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
    const approximatelyBoundsWidth = getBoundsWidth({chartWidth, chartMargin, preparedYAxis});
    const approximatelyBoundsHeight =
        (chartHeight - chartMargin.top - chartMargin.bottom - preparedLegend.paddingTop) / 2;
    const flattenLegendItems = getFlattenLegendItems(series);
    const items = getGroupedLegendItems({
        boundsWidth: approximatelyBoundsWidth,
        items: flattenLegendItems,
        preparedLegend,
    });
    let legendHeight = preparedLegend.lineHeight * items.length;
    let pagination: LegendConfig['pagination'] | undefined;

    if (approximatelyBoundsHeight < legendHeight) {
        legendHeight = approximatelyBoundsHeight;
        const limit = Math.floor(approximatelyBoundsHeight / preparedLegend.lineHeight) - 1;
        const capacity = items.slice(0, limit).reduce((acc, line) => {
            return acc + line.length;
        }, 0);
        const allItemsCount = items.reduce((acc, line) => {
            return acc + line.length;
        }, 0);
        const maxPage = Math.ceil(allItemsCount / capacity);
        pagination = {limit, maxPage};
    }

    preparedLegend.height = legendHeight;
    const top = chartHeight - chartMargin.bottom - preparedLegend.height;
    const offset: LegendConfig['offset'] = {left: chartMargin.left, top};

    return {legendConfig: {offset, pagination}, legendItems: items};
};
