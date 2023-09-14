import React from 'react';
import {axisLeft, ScaleLinear, select} from 'd3';
import type {AxisScale, AxisDomain} from 'd3';

import {block} from '../../../../utils/cn';

import type {ChartScale, PreparedAxis} from '../hooks';
import {
    formatAxisTickLabel,
    parseTransformStyle,
    setEllipsisForOverflowText,
    setEllipsisForOverflowTexts,
} from '../utils';

const b = block('d3-axis');
const EMPTY_SPACE_BETWEEN_LABELS = 10;
const MAX_WIDTH = 80;

type Props = {
    axises: PreparedAxis[];
    width: number;
    height: number;
    scale: ChartScale;
};

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
        const tickStep =
            axis.type === 'category'
                ? undefined
                : (scale as ScaleLinear<number, number>).ticks()[0];
        let yAxisGenerator = axisLeft(scale as AxisScale<AxisDomain>)
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
                    step: tickStep,
                });
            });

        if (axis.ticks.pixelInterval) {
            const ticksCount = height / axis.ticks.pixelInterval;
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
                .style('font-size', axis.labels.style.fontSize)
                .style('transform', 'translateY(-1px)');

            tickTexts.call(setEllipsisForOverflowTexts, MAX_WIDTH);
        }

        const transformStyle = svgElement.select('.tick').attr('transform');
        const {y} = parseTransformStyle(transformStyle);

        if (y === height) {
            // Remove stroke from tick that has the same y coordinate like domain
            svgElement.select('.tick line').style('stroke', 'none');
        }

        // remove overlapping ticks
        // Note: this method do not prepared for rotated labels
        let elementY = 0;
        svgElement
            .selectAll('.tick')
            .filter(function (_d, index) {
                const node = this as unknown as Element;
                const r = node.getBoundingClientRect();

                if (r.bottom > elementY && index !== 0) {
                    return true;
                }
                elementY = r.top - EMPTY_SPACE_BETWEEN_LABELS;
                return false;
            })
            .remove();

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
                .text(axis.title.text)
                .call(setEllipsisForOverflowText, height);
        }
    }, [axises, width, height, scale]);

    return <g ref={ref} />;
};
