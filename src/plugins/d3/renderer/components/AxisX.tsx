import React from 'react';
import block from 'bem-cn-lite';
import {axisBottom, select} from 'd3';
import type {AxisScale, AxisDomain, Selection} from 'd3';

import type {ChartOptions, ChartScale} from '../hooks';
import {formatAxisTickLabel, parseTransformStyle} from '../utils';

const b = block('chartkit-d3-axis');
const EMPTY_SPACE_BETWEEN_LABELS = 10;

type Props = {
    axis: ChartOptions['xAxis'];
    width: number;
    height: number;
    scale: ChartScale;
};

// Note: this method do not prepared for rotated labels
const removeOverlappingXTicks = (axis: Selection<SVGGElement, unknown, null, undefined>) => {
    const a = axis.selectAll('g.tick').nodes();

    if (a.length <= 1) {
        return;
    }

    for (let i = 0, x = 0; i < a.length; i++) {
        const node = a[i] as Element;
        const r = node.getBoundingClientRect();

        if (r.left < x) {
            node?.parentNode?.removeChild(node);
        } else {
            x = r.right + EMPTY_SPACE_BETWEEN_LABELS;
        }
    }
};

// FIXME: add overflow ellipsis for the labels that out of boundaries
export const AxisX = ({axis, width, height, scale}: Props) => {
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const tickSize = axis.grid.enabled ? height * -1 : 0;
        let xAxisGenerator = axisBottom(scale as AxisScale<AxisDomain>)
            .tickSize(tickSize)
            .tickPadding(axis.labels.padding)
            .tickFormat((value) => {
                if (!axis.labels.enabled) {
                    return '';
                }

                return formatAxisTickLabel({
                    axisType: axis.type,
                    value,
                    dateFormat: axis.labels['dateFormat'],
                    numberFormat: axis.labels['numberFormat'],
                });
            });

        if (axis.ticks.pixelInterval) {
            const ticksCount = width / axis.ticks.pixelInterval;
            xAxisGenerator = xAxisGenerator.ticks(ticksCount);
        }

        svgElement.call(xAxisGenerator).attr('class', b());
        svgElement.select('.domain').attr('d', `M0,0V0H${width}`);

        if (axis.labels.enabled) {
            svgElement.selectAll('.tick text').style('font-size', axis.labels.style.fontSize);
        }

        const transformStyle = svgElement.select('.tick').attr('transform');
        const {x} = parseTransformStyle(transformStyle);

        if (x === 0) {
            // Remove tick that has the same x coordinate like domain
            svgElement.select('.tick').remove();
        }

        if (axis.title.text) {
            const textY =
                axis.title.height + parseInt(axis.labels.style.fontSize) + axis.labels.padding;

            svgElement
                .append('text')
                .attr('class', b('title'))
                .attr('text-anchor', 'middle')
                .attr('x', width / 2)
                .attr('y', textY)
                .attr('font-size', axis.title.style.fontSize)
                .text(axis.title.text);
        }

        removeOverlappingXTicks(svgElement);
    }, [axis, width, height, scale]);

    return <g ref={ref} />;
};
