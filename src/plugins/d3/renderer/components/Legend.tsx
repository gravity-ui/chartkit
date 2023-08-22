import React from 'react';
import {select} from 'd3';

import {block} from '../../../../utils/cn';
import type {ChartSeries, OnLegendItemClick} from '../hooks';
import {isAxisRelatedSeries} from '../utils';

const b = block('d3-legend');

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
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const legendItems = (
            chartSeries.length === 1 && !isAxisRelatedSeries(chartSeries[0])
                ? chartSeries[0].data
                : chartSeries
        ) as {color: string; name: string; visible?: boolean}[];

        const size = 10;
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
            .attr('class', b('item-shape'))
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
    }, [width, offsetWidth, height, offsetHeight, chartSeries, onItemClick]);

    return <g ref={ref} width={width} height={height} />;
};
