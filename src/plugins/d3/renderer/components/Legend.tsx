import React from 'react';
import {select} from 'd3';
import type {Selection} from 'd3';

import {block} from '../../../../utils/cn';
import type {
    OnLegendItemClick,
    PreparedLegend,
    PreparedSeries,
    LegendItem,
    LegendConfig,
} from '../hooks';

const b = block('d3-legend');

type Props = {
    boundsWidth: number;
    chartSeries: PreparedSeries[];
    legend: PreparedLegend;
    items: LegendItem[][];
    config: LegendConfig;
    onItemClick: OnLegendItemClick;
};

const getLegendPosition = (args: {
    align: PreparedLegend['align'];
    contentWidth: number;
    width: number;
    offsetWidth: number;
}) => {
    const {align, offsetWidth, width, contentWidth} = args;
    const top = 0;

    if (align === 'left') {
        return {top, left: offsetWidth};
    }

    if (align === 'right') {
        return {top, left: offsetWidth + width - contentWidth};
    }

    return {top, left: offsetWidth + width / 2 - contentWidth / 2};
};

const appendPaginator = (args: {
    container: Selection<SVGGElement, unknown, null, undefined>;
    offset: number;
    maxPage: number;
    legend: PreparedLegend;
    transform: string;
    onArrowClick: (offset: number) => void;
}) => {
    const {container, offset, maxPage, legend, transform, onArrowClick} = args;
    const paginationLine = container.append('g').attr('class', b('pagination'));
    let computedWidth = 0;

    paginationLine
        .append('text')
        .text('▲')
        .attr('class', function () {
            return b('pagination-arrow', {inactive: offset === 0});
        })
        .style('font-size', legend.itemStyle.fontSize)
        .each(function () {
            computedWidth += this.getComputedTextLength();
        })
        .on('click', function () {
            if (offset - 1 >= 0) {
                onArrowClick(offset - 1);
            }
        });
    paginationLine
        .append('text')
        .text(`${offset + 1}/${maxPage}`)
        .attr('class', b('pagination-counter'))
        .attr('x', computedWidth)
        .style('font-size', legend.itemStyle.fontSize)
        .each(function () {
            computedWidth += this.getComputedTextLength();
        });
    paginationLine
        .append('text')
        .text('▼')
        .attr('class', function () {
            return b('pagination-arrow', {inactive: offset === maxPage - 1});
        })
        .attr('x', computedWidth)
        .style('font-size', legend.itemStyle.fontSize)
        .on('click', function () {
            if (offset + 1 < maxPage) {
                onArrowClick(offset + 1);
            }
        });
    paginationLine.attr('transform', transform);
};

export const Legend = (props: Props) => {
    const {boundsWidth, chartSeries, legend, items, config, onItemClick} = props;
    const ref = React.useRef<SVGGElement>(null);
    const [paginationOffset, setPaginationOffset] = React.useState(0);

    React.useEffect(() => {
        setPaginationOffset(0);
    }, [boundsWidth]);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const limit = config.pagination?.limit;
        const pageItems =
            typeof limit === 'number'
                ? items.slice(paginationOffset * limit, paginationOffset * limit + limit)
                : items;
        pageItems.forEach((line, lineIndex) => {
            const legendLine = svgElement.append('g').attr('class', b('line'));
            const legendItemTemplate = legendLine
                .selectAll('legend-history')
                .data(line)
                .enter()
                .append('g')
                .attr('class', b('item'))
                .on('click', function (e, d) {
                    onItemClick({name: d.name, metaKey: e.metaKey});
                });

            const getXPosition = (i: number) => {
                return line.slice(0, i).reduce((acc, legendItem) => {
                    return (
                        acc +
                        legendItem.symbol.width +
                        legendItem.symbol.padding +
                        legendItem.textWidth +
                        legend.itemDistance
                    );
                }, 0);
            };

            legendItemTemplate
                .append('rect')
                .attr('x', function (_d, i) {
                    return getXPosition(i);
                })
                .attr('y', (legendItem) => {
                    return Math.max(0, (legend.lineHeight - legendItem.symbol.height) / 2);
                })
                .attr('width', (legendItem) => {
                    return legendItem.symbol.width;
                })
                .attr('height', (legendItem) => legendItem.symbol.height)
                .attr('rx', (legendItem) => legendItem.symbol.radius)
                .attr('class', function (d) {
                    return b('item-shape', {unselected: !d.visible});
                })
                .style('fill', function (d) {
                    return d.visible ? d.color : '';
                });

            legendItemTemplate
                .append('text')
                .attr('x', function (legendItem, i) {
                    return getXPosition(i) + legendItem.symbol.width + legendItem.symbol.padding;
                })
                .attr('height', legend.lineHeight)
                .attr('class', function (d) {
                    const mods = {selected: d.visible, unselected: !d.visible};
                    return b('item-text', mods);
                })
                .text(function (d) {
                    return ('name' in d && d.name) as string;
                })
                .style('font-size', legend.itemStyle.fontSize)
                .style('alignment-baseline', 'before-edge');

            const contentWidth = legendLine.node()?.getBoundingClientRect().width || 0;
            const {left} = getLegendPosition({
                align: legend.align,
                width: boundsWidth,
                offsetWidth: config.offset.left,
                contentWidth,
            });
            const top = config.offset.top + legend.lineHeight * lineIndex;

            legendLine.attr('transform', `translate(${[left, top].join(',')})`);
        });

        if (config.pagination) {
            const transform = `translate(${[
                config.offset.left,
                config.offset.top +
                    legend.lineHeight * config.pagination.limit +
                    legend.lineHeight / 2,
            ].join(',')})`;
            appendPaginator({
                container: svgElement,
                offset: paginationOffset,
                maxPage: config.pagination.maxPage,
                legend,
                transform,
                onArrowClick: setPaginationOffset,
            });
        }
    }, [boundsWidth, chartSeries, onItemClick, legend, items, config, paginationOffset]);

    return <g ref={ref} width={boundsWidth} height={legend.height} />;
};
