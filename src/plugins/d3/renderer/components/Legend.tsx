import React from 'react';

import {BaseType, line as lineGenerator, scaleLinear, select, symbol} from 'd3';
import type {Selection} from 'd3';

import {block} from '../../../../utils/cn';
import {GRADIENT_LEGEND_SIZE} from '../constants';
import type {
    LegendConfig,
    LegendItem,
    OnLegendItemClick,
    PreparedLegend,
    PreparedSeries,
    SymbolLegendSymbol,
} from '../hooks';
import {getLineDashArray} from '../hooks/useShapes/utils';
import {createGradientRect, getContinuesColorFn, getLabelsSize, getSymbol} from '../utils';
import {axisBottom} from '../utils/axis-generators';

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

const legendSymbolGenerator = lineGenerator<{x: number; y: number}>()
    .x((d) => d.x)
    .y((d) => d.y);

function renderLegendSymbol(args: {
    selection: Selection<SVGGElement, LegendItem, BaseType, unknown>;
    legend: PreparedLegend;
}) {
    const {selection, legend} = args;
    const line = selection.data();

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

    selection.each(function (d, i) {
        const element = select(this);
        const x = getXPosition(i);
        const className = b('item-symbol', {shape: d.symbol.shape, unselected: !d.visible});
        const color = d.visible ? d.color : '';

        switch (d.symbol.shape) {
            case 'path': {
                const y = legend.lineHeight / 2;
                const points = [
                    {x: x, y},
                    {x: x + d.symbol.width, y},
                ];

                element
                    .append('path')
                    .attr('d', legendSymbolGenerator(points))
                    .attr('fill', 'none')
                    .attr('stroke-width', d.symbol.strokeWidth)
                    .attr('class', className)
                    .style('stroke', color);

                if (d.dashStyle) {
                    element.attr(
                        'stroke-dasharray',
                        getLineDashArray(d.dashStyle, d.symbol.strokeWidth),
                    );
                }

                break;
            }
            case 'rect': {
                const y = (legend.lineHeight - d.symbol.height) / 2;
                element
                    .append('rect')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('width', d.symbol.width)
                    .attr('height', d.symbol.height)
                    .attr('rx', d.symbol.radius)
                    .attr('class', className)
                    .style('fill', color);

                break;
            }
            case 'symbol': {
                const y = legend.lineHeight / 2;

                element
                    .append('svg:path')
                    .attr('d', () => {
                        const scatterSymbol = getSymbol(
                            (d.symbol as SymbolLegendSymbol).symbolType,
                        );

                        // D3 takes size as square pixels, so we need to make square pixels size by multiplying
                        // https://d3js.org/d3-shape/symbol#symbol
                        return symbol(scatterSymbol, d.symbol.width * d.symbol.width)();
                    })
                    .attr('transform', () => {
                        return 'translate(' + x + ',' + y + ')';
                    })
                    .attr('class', className)
                    .style('fill', color);

                break;
            }
        }
    });
}

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

        if (legend.type === 'discrete') {
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

                renderLegendSymbol({selection: legendItemTemplate, legend});

                legendItemTemplate
                    .append('text')
                    .attr('x', function (legendItem, i) {
                        return (
                            getXPosition(i) + legendItem.symbol.width + legendItem.symbol.padding
                        );
                    })
                    .attr('height', legend.lineHeight)
                    .attr('class', function (d) {
                        const mods = {selected: d.visible, unselected: !d.visible};
                        return b('item-text', mods);
                    })
                    .text(function (d) {
                        return ('name' in d && d.name) as string;
                    })
                    .style('font-size', legend.itemStyle.fontSize);

                const contentWidth = legendLine.node()?.getBoundingClientRect().width || 0;
                const {left} = getLegendPosition({
                    align: legend.align,
                    width: boundsWidth,
                    offsetWidth: 0,
                    contentWidth,
                });
                const top = legend.lineHeight * lineIndex;

                legendLine.attr('transform', `translate(${[left, top].join(',')})`);
            });

            if (config.pagination) {
                const transform = `translate(${[
                    0,
                    legend.lineHeight * config.pagination.limit + legend.lineHeight / 2,
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
        } else {
            // gradient rect
            const domain = legend.colorScale.domain ?? [];
            const rectHeight = GRADIENT_LEGEND_SIZE.height;
            svgElement.call(createGradientRect, {
                y: legend.title.height + legend.title.margin,
                height: rectHeight,
                width: legend.width,
                interpolator: getContinuesColorFn({
                    values: [0, 1],
                    colors: legend.colorScale.colors,
                    stops: legend.colorScale.stops,
                }),
            });

            // ticks
            const xAxisGenerator = axisBottom({
                scale: scaleLinear(domain, [0, legend.width]),
                ticks: {
                    items: [[0, -rectHeight]],
                    labelsMargin: legend.ticks.labelsMargin,
                    labelsLineHeight: legend.ticks.labelsLineHeight,
                    maxTickCount: 4,
                    tickColor: '#fff',
                },
            });
            const tickTop = legend.title.height + legend.title.margin + rectHeight;
            svgElement
                .append('g')
                .attr('transform', `translate(0, ${tickTop})`)
                .call(xAxisGenerator);
        }

        if (legend.title.enable) {
            const {maxWidth: labelWidth} = getLabelsSize({
                labels: [legend.title.text],
                style: legend.title.style,
            });
            svgElement
                .append('g')
                .attr('class', b('title'))
                .append('text')
                .attr('dx', legend.width / 2 - labelWidth / 2)
                .attr('font-weight', legend.title.style.fontWeight ?? null)
                .attr('font-size', legend.title.style.fontSize ?? null)
                .attr('fill', legend.title.style.fontColor ?? null)
                .style('alignment-baseline', 'before-edge')
                .text(legend.title.text);
        }

        const {left} = getLegendPosition({
            align: legend.align,
            width: boundsWidth,
            offsetWidth: config.offset.left,
            contentWidth: svgElement.node()?.getBoundingClientRect().width || 0,
        });
        svgElement.attr('transform', `translate(${[left, config.offset.top].join(',')})`);
    }, [boundsWidth, chartSeries, onItemClick, legend, items, config, paginationOffset]);

    return <g className={b()} ref={ref} width={boundsWidth} height={legend.height} />;
};
