import React from 'react';

import {axisLeft, axisRight, line, select} from 'd3';
import type {Axis, AxisDomain, AxisScale, Selection} from 'd3';

import type {ChartKitWidgetSplit} from '../../../../types';
import {block} from '../../../../utils/cn';
import type {ChartScale, PreparedAxis} from '../hooks';
import {
    calculateCos,
    calculateNumericProperty,
    calculateSin,
    formatAxisTickLabel,
    getAxisHeight,
    getClosestPointsRange,
    getScaleTicks,
    getTicksCount,
    parseTransformStyle,
    setEllipsisForOverflowText,
    setEllipsisForOverflowTexts,
} from '../utils';

const b = block('d3-axis');

type Props = {
    axes: PreparedAxis[];
    scale: ChartScale[];
    width: number;
    height: number;
    split?: ChartKitWidgetSplit;
};

function transformLabel(args: {node: Element; axis: PreparedAxis}) {
    const {node, axis} = args;
    let topOffset = axis.labels.lineHeight / 2;
    let leftOffset = axis.labels.margin;

    if (axis.position === 'left') {
        leftOffset = leftOffset * -1;
    }

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

function getAxisGenerator(args: {
    preparedAxis: PreparedAxis;
    axisGenerator: Axis<AxisDomain>;
    width: number;
    height: number;
    scale: ChartScale;
}) {
    const {preparedAxis, axisGenerator: generator, width, height, scale} = args;
    const tickSize = preparedAxis.grid.enabled ? width * -1 : 0;
    const step = getClosestPointsRange(preparedAxis, getScaleTicks(scale as AxisScale<AxisDomain>));

    let axisGenerator = generator
        .tickSize(tickSize)
        .tickPadding(preparedAxis.labels.margin)
        .tickFormat((value) => {
            if (!preparedAxis.labels.enabled) {
                return '';
            }

            return formatAxisTickLabel({
                axis: preparedAxis,
                value,
                step,
            });
        });

    const ticksCount = getTicksCount({axis: preparedAxis, range: height});
    if (ticksCount) {
        axisGenerator = axisGenerator.ticks(ticksCount);
    }

    return axisGenerator;
}

export const AxisY = (props: Props) => {
    const {axes, width, height: totalHeight, scale, split} = props;
    const splitGap = calculateNumericProperty({value: split?.gap, base: totalHeight}) ?? 0;
    const height = getAxisHeight({split, boundsHeight: totalHeight});
    const ref = React.useRef<SVGGElement | null>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();

        const axisSelection = svgElement
            .selectAll('axis')
            .data(axes)
            .join('g')
            .attr('class', b())
            .style('transform', (d) => {
                const top = d.plotIndex * (height + splitGap);
                if (d.position === 'left') {
                    return `translate(0, ${top}px)`;
                }

                return `translate(${width}px, 0)`;
            });

        axisSelection.each((d, index, node) => {
            const seriesScale = scale[index];
            const axisItem = select(node[index]) as Selection<
                SVGGElement,
                PreparedAxis,
                any,
                unknown
            >;
            const yAxisGenerator = getAxisGenerator({
                axisGenerator:
                    d.position === 'left'
                        ? axisLeft(seriesScale as AxisScale<AxisDomain>)
                        : axisRight(seriesScale as AxisScale<AxisDomain>),
                preparedAxis: d,
                height,
                width,
                scale: seriesScale,
            });
            yAxisGenerator(axisItem);

            if (d.labels.enabled) {
                const tickTexts = axisItem
                    .selectAll<SVGTextElement, string>('.tick text')
                    // The offset must be applied before the labels are rotated.
                    // Therefore, we reset the values and make an offset in transform  attribute.
                    // FIXME: give up axisLeft(d3) and switch to our own generation method
                    .attr('x', null)
                    .attr('dy', null)
                    .style('font-size', d.labels.style.fontSize)
                    .style('transform', function () {
                        return transformLabel({node: this, axis: d});
                    });
                const textMaxWidth =
                    !d.labels.rotation || Math.abs(d.labels.rotation) % 360 !== 90
                        ? d.labels.maxWidth
                        : (height - d.labels.padding * (tickTexts.size() - 1)) / tickTexts.size();
                tickTexts.call(setEllipsisForOverflowTexts, textMaxWidth);
            }

            // remove overlapping ticks
            // Note: this method do not prepared for rotated labels
            if (!d.labels.rotation) {
                let elementY = 0;
                axisItem
                    .selectAll('.tick')
                    .filter(function (_d, tickIndex) {
                        const tickNode = this as unknown as Element;
                        const r = tickNode.getBoundingClientRect();

                        if (r.bottom > elementY && tickIndex !== 0) {
                            return true;
                        }
                        elementY = r.top - d.labels.padding;
                        return false;
                    })
                    .remove();
            }

            return axisItem;
        });

        axisSelection
            .select('.domain')
            .attr('d', () => {
                const points: [number, number][] = [
                    [0, 0],
                    [0, height],
                ];

                return line()(points);
            })
            .style('stroke', (d) => d.lineColor || '');

        svgElement.selectAll('.tick').each((_d, index, nodes) => {
            const tickNode = select(nodes[index]);
            if (parseTransformStyle(tickNode.attr('transform')).y === height) {
                // Remove stroke from tick that has the same y coordinate like domain
                tickNode.select('line').style('stroke', 'none');
            }
        });

        axisSelection
            .append('text')
            .attr('class', b('title'))
            .attr('text-anchor', 'middle')
            .attr('dy', (d) => -(d.title.margin + d.labels.margin + d.labels.width))
            .attr('dx', (d) => (d.position === 'left' ? -height / 2 : height / 2))
            .attr('font-size', (d) => d.title.style.fontSize)
            .attr('transform', (d) => (d.position === 'left' ? 'rotate(-90)' : 'rotate(90)'))
            .text((d) => d.title.text)
            .each((_d, index, node) => {
                return setEllipsisForOverflowText(
                    select(node[index]) as Selection<SVGTextElement, unknown, null, unknown>,
                    height,
                );
            });
    }, [axes, width, height, scale, splitGap]);

    return <g ref={ref} className={b('container')} />;
};
