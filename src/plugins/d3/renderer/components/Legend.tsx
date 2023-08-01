import React from 'react';
import block from 'bem-cn-lite';
import {select} from 'd3';

import type {OnLegendItemClick} from './useLegend';
import type {ChartSeries} from './useSeries';

const b = block('chartkit-d3-legend');

type Props = {
    width: number;
    height: number;
    offsetWidth: number;
    offsetHeight: number;
    chartSeries: ChartSeries[];
    onItemClick: OnLegendItemClick;
};

export const Legend = (props: Props) => {
    const {width, offsetWidth, height, offsetHeight, chartSeries, onItemClick} = props;

    return (
        <g
            width={width}
            height={height}
            ref={(node) => {
                if (!node) {
                    return;
                }

                const size = 10;
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
                            offsetWidth +
                            i * size +
                            textWidths.slice(0, i + 1).reduce((acc, tw) => acc + tw, 0)
                        );
                    })
                    .attr('y', offsetHeight - size / 2)
                    .attr('width', size)
                    .attr('height', size)
                    .style('fill', function (d) {
                        return d.color;
                    });
                legendItemTemplate
                    .append('text')
                    .attr('x', function (_d, i) {
                        return (
                            offsetWidth +
                            i * size +
                            size +
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
