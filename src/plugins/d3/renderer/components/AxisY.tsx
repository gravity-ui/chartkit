import React from 'react';

import {axisLeft, select} from 'd3';
import type {AxisDomain, AxisScale} from 'd3';

import {block} from '../../../../utils/cn';
import type {ChartScale, PreparedAxis} from '../hooks';
import {
    calculateCos,
    calculateSin,
    formatAxisTickLabel,
    getClosestPointsRange,
    getScaleTicks,
    getTicksCount,
    parseTransformStyle,
    setEllipsisForOverflowText,
    setEllipsisForOverflowTexts,
} from '../utils';

const b = block('d3-axis');

type Props = {
    axises: PreparedAxis[];
    width: number;
    height: number;
    scale: ChartScale;
};

function transformLabel(node: Element, axis: PreparedAxis) {
    let topOffset = axis.labels.lineHeight / 2;
    let leftOffset = -axis.labels.margin;
    if (axis.labels.rotation) {
        if (axis.labels.rotation > 0) {
            leftOffset -= axis.labels.lineHeight * calculateSin(axis.labels.rotation);
            topOffset = axis.labels.lineHeight * calculateCos(axis.labels.rotation);

            if (axis.labels.rotation % 360 === 90) {
                topOffset = (node?.getBoundingClientRect().width || 0) / 2;
            }
        } else {
            topOffset = 0;

            if (axis.labels.rotation % 360 === -90) {
                topOffset = -(node?.getBoundingClientRect().width || 0) / 2;
            }
        }

        return `translate(${leftOffset}px, ${topOffset}px) rotate(${axis.labels.rotation}deg)`;
    }

    return `translate(${leftOffset}px, ${topOffset}px)`;
}

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
        const step = getClosestPointsRange(axis, getScaleTicks(scale as AxisScale<AxisDomain>));

        let yAxisGenerator = axisLeft(scale as AxisScale<AxisDomain>)
            .tickSize(tickSize)
            .tickPadding(axis.labels.margin)
            .tickFormat((value) => {
                if (!axis.labels.enabled) {
                    return '';
                }

                return formatAxisTickLabel({
                    axis,
                    value,
                    step,
                });
            });

        const ticksCount = getTicksCount({axis, range: height});
        if (ticksCount) {
            yAxisGenerator = yAxisGenerator.ticks(ticksCount);
        }

        svgElement.call(yAxisGenerator).attr('class', b());
        svgElement
            .select('.domain')
            .attr('d', `M0,${height}H0V0`)
            .style('stroke', axis.lineColor || '');

        if (axis.labels.enabled) {
            const tickTexts = svgElement
                .selectAll<SVGTextElement, string>('.tick text')
                // The offset must be applied before the labels are rotated.
                // Therefore, we reset the values and make an offset in transform  attribute.
                // FIXME: give up axisLeft(d3) and switch to our own generation method
                .attr('x', null)
                .attr('dy', null)
                .style('font-size', axis.labels.style.fontSize)
                .style('transform', function () {
                    return transformLabel(this, axis);
                });
            const textMaxWidth =
                !axis.labels.rotation || Math.abs(axis.labels.rotation) % 360 !== 90
                    ? axis.labels.maxWidth
                    : (height - axis.labels.padding * (tickTexts.size() - 1)) / tickTexts.size();
            tickTexts.call(setEllipsisForOverflowTexts, textMaxWidth);
        }

        const transformStyle = svgElement.select('.tick').attr('transform');
        const {y} = parseTransformStyle(transformStyle);

        if (y === height) {
            // Remove stroke from tick that has the same y coordinate like domain
            svgElement.select('.tick line').style('stroke', 'none');
        }

        // remove overlapping ticks
        // Note: this method do not prepared for rotated labels
        if (!axis.labels.rotation) {
            let elementY = 0;
            svgElement
                .selectAll('.tick')
                .filter(function (_d, index) {
                    const node = this as unknown as Element;
                    const r = node.getBoundingClientRect();

                    if (r.bottom > elementY && index !== 0) {
                        return true;
                    }
                    elementY = r.top - axis.labels.padding;
                    return false;
                })
                .remove();
        }

        if (axis.title.text) {
            const textY = axis.title.margin + axis.labels.margin + axis.labels.width;

            svgElement
                .append('text')
                .attr('class', b('title'))
                .attr('text-anchor', 'middle')
                .attr('dy', -textY)
                .attr('dx', -height / 2)
                .attr('font-size', axis.title.style.fontSize)
                .attr('transform', 'rotate(-90)')
                .text(axis.title.text)
                .call(setEllipsisForOverflowText, height);
        }
    }, [axises, width, height, scale]);

    return <g ref={ref} />;
};
