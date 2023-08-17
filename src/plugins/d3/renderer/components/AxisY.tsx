import React from 'react';
import block from 'bem-cn-lite';
import {axisLeft, select} from 'd3';
import type {AxisScale, AxisDomain, Selection} from 'd3';

import type {ChartOptions, ChartScale} from '../hooks';
import {formatAxisTickLabel, parseTransformStyle} from '../utils';

const b = block('chartkit-d3-axis');
const EMPTY_SPACE_BETWEEN_LABELS = 10;

type Props = {
    axises: ChartOptions['yAxis'];
    width: number;
    height: number;
    scale: ChartScale;
};

// Note: this method do not prepared for rotated labels
const removeOverlappingYTicks = (axis: Selection<SVGGElement, unknown, null, undefined>) => {
    const a = axis.selectAll('g.tick').nodes();

    if (a.length <= 1) {
        return;
    }

    for (let i = 0, x = 0; i < a.length; i++) {
        const node = a[i] as Element;
        const r = node.getBoundingClientRect();

        if (r.bottom > x && i !== 0) {
            node?.parentNode?.removeChild(node);
        } else {
            x = r.top - EMPTY_SPACE_BETWEEN_LABELS;
        }
    }
};

// FIXME: add overflow ellipsis for the labels that out of boundaries
export const AxisY = ({axises, width, height, scale}: Props) => {
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const axis = axises[0];
        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const tickSize = axis.grid.enabled ? width * -1 : 0;
        const yAxisGenerator = axisLeft(scale as AxisScale<AxisDomain>)
            .tickSize(tickSize)
            .tickPadding(axis.labels.padding)
            .tickFormat((value) => {
                return formatAxisTickLabel({
                    axisType: axis.type,
                    value,
                    labels: axis.labels,
                });
            });

        svgElement.call(yAxisGenerator).attr('class', b());
        svgElement.select('.domain').attr('d', `M0,${height}H0V0`);

        if (axis.labels.enabled) {
            svgElement
                .selectAll('.tick text')
                .style('font-size', axis.labels.style.fontSize)
                .style('transform', 'translateY(-1px)');
        }

        const transformStyle = svgElement.select('.tick').attr('transform');
        const {y} = parseTransformStyle(transformStyle);

        if (y === height) {
            // Remove stroke from tick that has the same y coordinate like domain
            svgElement.select('.tick line').style('stroke', 'none');
        }

        if (axis.title.text) {
            const textY = axis.title.height + axis.labels.padding;

            svgElement
                .append('text')
                .attr('class', b('title'))
                .attr('text-anchor', 'middle')
                .attr('dy', -textY)
                .attr('dx', -height / 2)
                .attr('font-size', axis.title.style.fontSize)
                .attr('transform', 'rotate(-90)')
                .text(axis.title.text);
        }

        removeOverlappingYTicks(svgElement);
    }, [axises, width, height, scale]);

    return <g ref={ref} />;
};
