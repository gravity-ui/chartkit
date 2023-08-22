import React from 'react';
import {select} from 'd3';

import {block} from '../../../../utils/cn';
import type {ChartSeries, OnLegendItemClick, PreparedLegend} from '../hooks';

const b = block('d3-legend');

type Props = {
    width: number;
    height: number;
    offsetWidth: number;
    offsetHeight: number;
    legend: PreparedLegend;
    chartSeries: ChartSeries[];
    onItemClick: OnLegendItemClick;
};

function getSeriesLegendWidth(legend: PreparedLegend, series: ChartSeries) {
    let width = 0;

    select<HTMLElement, ChartSeries>(document.body)
        .append('text')
        .text(series.name)
        .each(function () {
            width = this.getBoundingClientRect().width;
        })
        .remove();

    return legend.symbol.width + legend.symbol.padding + width;
}

export const Legend = (props: Props) => {
    const {width, height, offsetWidth, offsetHeight, chartSeries, onItemClick, legend} = props;

    const left = React.useMemo(() => {
        if (legend.align === 'left') {
            return offsetWidth;
        }

        const contentWidth =
            chartSeries.reduce((acc, s) => acc + getSeriesLegendWidth(legend, s), 0) +
            (chartSeries.length - 1) * legend.itemDistance;

        if (legend.align === 'right') {
            return offsetWidth + width - contentWidth;
        }

        return offsetWidth + width / 2 - contentWidth / 2;
    }, [chartSeries, legend, offsetWidth, width]);

    return (
        <g
            width={width}
            height={height}
            transform={`translate(${[left, 0].join(',')})`}
            ref={(node) => {
                if (!node) {
                    return;
                }

                const textWidths: number[] = [0];
                const svgElement = select(node);
                svgElement.selectAll('*').remove();
                const legendItemTemplate = svgElement
                    .selectAll('legend-history')
                    .data(chartSeries)
                    .enter()
                    .append('g')
                    .attr('class', b('item'))
                    .on('click', function (e, d) {
                        onItemClick({name: d.name, metaKey: e.metaKey});
                    });
                svgElement
                    .selectAll('*')
                    .data(chartSeries)
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
                    .attr('x', function (_d, i) {
                        return (
                            i * legend.symbol.width +
                            i * legend.itemDistance +
                            i * legend.symbol.padding +
                            textWidths.slice(0, i + 1).reduce((acc, tw) => acc + tw, 0)
                        );
                    })
                    .attr('y', offsetHeight - legend.symbol.height / 2)
                    .attr('width', legend.symbol.width)
                    .attr('height', legend.symbol.height)
                    .attr('rx', legend.symbol.radius)
                    .style('fill', function (d) {
                        return d.color;
                    });
                legendItemTemplate
                    .append('text')
                    .attr('x', function (_d, i) {
                        return (
                            i * legend.symbol.width +
                            i * legend.itemDistance +
                            i * legend.symbol.padding +
                            legend.symbol.width +
                            legend.symbol.padding +
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
            }}
        />
    );
};
