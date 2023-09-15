import React from 'react';
import {axisBottom, ScaleLinear, select} from 'd3';
import type {AxisScale, AxisDomain} from 'd3';

import {block} from '../../../../utils/cn';

import type {ChartScale, PreparedAxis} from '../hooks';
import {
    formatAxisTickLabel,
    getClosestPointsRange,
    parseTransformStyle,
    setEllipsisForOverflowText,
    getTicksCount,
} from '../utils';

const b = block('d3-axis');
const EMPTY_SPACE_BETWEEN_LABELS = 10;

type Props = {
    axis: PreparedAxis;
    width: number;
    height: number;
    scale: ChartScale;
    chartWidth: number;
};

// FIXME: add overflow ellipsis for the labels that out of boundaries
export const AxisX = ({axis, width, height, scale, chartWidth}: Props) => {
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const tickSize = axis.grid.enabled ? height * -1 : 0;
        const ticks =
            axis.type === 'category' ? [] : (scale as ScaleLinear<number, number>).ticks();
        const tickStep = getClosestPointsRange(axis, ticks);
        let xAxisGenerator = axisBottom(scale as AxisScale<AxisDomain>)
            .tickSize(tickSize)
            .tickPadding(axis.labels.padding)
            .tickFormat((value) => {
                if (!axis.labels.enabled) {
                    return '';
                }

                return formatAxisTickLabel({
                    axis,
                    value,
                    step: tickStep,
                });
            });

        const ticksCount = getTicksCount({axis, range: width});
        if (ticksCount) {
            xAxisGenerator = xAxisGenerator.ticks(ticksCount);
        }

        svgElement.call(xAxisGenerator).attr('class', b());
        svgElement
            .select('.domain')
            .attr('d', `M0,0V0H${width}`)
            .style('stroke', axis.lineColor || '');

        if (axis.labels.enabled) {
            svgElement.selectAll('.tick text').style('font-size', axis.labels.style.fontSize);
        }

        const transformStyle = svgElement.select('.tick').attr('transform');
        const {x} = parseTransformStyle(transformStyle);

        if (x === 0) {
            // Remove tick that has the same x coordinate like domain
            svgElement.select('.tick').remove();
        }

        // remove overlapping labels
        let elementX = 0;
        svgElement
            .selectAll('.tick')
            .filter(function () {
                const node = this as unknown as Element;
                const r = node.getBoundingClientRect();

                if (r.left < elementX) {
                    return true;
                }
                elementX = r.right + EMPTY_SPACE_BETWEEN_LABELS;
                return false;
            })
            .remove();

        // add an ellipsis to the labels on the right that go beyond the boundaries of the chart
        svgElement.selectAll('.tick text').each(function () {
            const node = this as unknown as SVGTextElement;
            const textRect = node.getBoundingClientRect();

            if (textRect.right > chartWidth) {
                const maxWidth = textRect.width - (textRect.right - chartWidth) * 2;
                select(node).call(setEllipsisForOverflowText, maxWidth);
            }
        });

        // add an axis header if necessary
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
                .text(axis.title.text)
                .call(setEllipsisForOverflowText, width);
        }
    }, [axis, width, height, scale]);

    return <g ref={ref} />;
};
