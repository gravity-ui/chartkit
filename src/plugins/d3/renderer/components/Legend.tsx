import React from 'react';
import {select, sum} from 'd3';
import get from 'lodash/get';

import {block} from '../../../../utils/cn';
import type {
    OnLegendItemClick,
    PreparedLegend,
    PreparedLegendSymbol,
    PreparedSeries,
} from '../hooks';

const b = block('d3-legend');

type Props = {
    width: number;
    height: number;
    legend: PreparedLegend;
    offsetWidth: number;
    offsetHeight: number;
    chartSeries: PreparedSeries[];
    onItemClick: OnLegendItemClick;
};

type LegendItem = {
    color: string;
    name: string;
    visible?: boolean;
    symbol: PreparedLegendSymbol;
};

const getLegendItems = (series: PreparedSeries[]) => {
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

function getLegendPosition(args: {
    align: PreparedLegend['align'];
    contentWidth: number;
    width: number;
    offsetWidth: number;
}) {
    const {align, offsetWidth, width, contentWidth} = args;
    const top = 0;

    if (align === 'left') {
        return {top, left: offsetWidth};
    }

    if (align === 'right') {
        return {top, left: offsetWidth + width - contentWidth};
    }

    return {top, left: offsetWidth + width / 2 - contentWidth / 2};
}

export const Legend = (props: Props) => {
    const {width, offsetWidth, height, offsetHeight, chartSeries, legend, onItemClick} = props;
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const legendItems = getLegendItems(chartSeries);
        const textWidths: number[] = [0];
        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const legendItemTemplate = svgElement
            .selectAll('legend-history')
            .data(legendItems)
            .enter()
            .append('g')
            .attr('class', b('item'))
            .on('click', function (e, d) {
                onItemClick({name: d.name, metaKey: e.metaKey});
            });
        svgElement
            .selectAll('*')
            .data(legendItems)
            .append('text')
            .text(function (d) {
                return d.name;
            })
            .each(function () {
                textWidths.push(this.getComputedTextLength());
            })
            .remove();

        legendItemTemplate
            .append('rect')
            .attr('x', function (legendItem, i) {
                return (
                    i * legendItem.symbol.width +
                    i * legend.itemDistance +
                    i * legendItem.symbol.padding +
                    textWidths.slice(0, i + 1).reduce((acc, tw) => acc + tw, 0)
                );
            })
            .attr('y', (legendItem) => offsetHeight - legendItem.symbol.height / 2)
            .attr('width', (legendItem) => {
                return legendItem.symbol.width;
            })
            .attr('height', (legendItem) => legendItem.symbol.height)
            .attr('rx', (legendItem) => legendItem.symbol.radius)
            .attr('class', b('item-shape'))
            .style('fill', function (d) {
                return d.color;
            });
        legendItemTemplate
            .append('text')
            .attr('x', function (legendItem, i) {
                return (
                    i * legendItem.symbol.width +
                    i * legend.itemDistance +
                    i * legendItem.symbol.padding +
                    legendItem.symbol.width +
                    legendItem.symbol.padding +
                    textWidths.slice(0, i + 1).reduce((acc, tw) => acc + tw, 0)
                );
            })
            .attr('y', offsetHeight)
            .attr('class', function (d) {
                const mods = {selected: d.visible, unselected: !d.visible};
                return b('item-text', mods);
            })
            .text(function (d) {
                return ('name' in d && d.name) as string;
            })
            .style('alignment-baseline', 'middle');

        const contentWidth =
            sum(textWidths) +
            sum(legendItems, (item) => item.symbol.width + item.symbol.padding) +
            legend.itemDistance * (legendItems.length - 1);

        const {left} = getLegendPosition({
            align: legend.align,
            width,
            offsetWidth,
            contentWidth,
        });

        svgElement.attr('transform', `translate(${[left, 0].join(',')})`);
    }, [width, offsetWidth, height, offsetHeight, chartSeries, onItemClick, legend]);

    return <g ref={ref} width={width} height={height} />;
};
