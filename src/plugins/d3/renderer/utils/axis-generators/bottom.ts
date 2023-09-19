import type {AxisDomain, AxisScale, Selection} from 'd3';
import {getXAxisItems, getXAxisOffset, getXTickPosition} from '../axis';
import {BaseTextStyle} from '../../../../../types';
import {hasOverlappingLabels} from '../text';

type AxisBottomArgs = {
    scale: AxisScale<AxisDomain>;
    ticks: {
        count?: number;
        maxTickCount: number;
        labelFormat: (value: any) => string;
        labelsPaddings?: number;
        labelsMargin?: number;
        labelsStyle?: BaseTextStyle;
        size: number;
        autoRotation?: boolean;
    };
    domain: {
        size: number;
        color?: string;
    };
};

function addDomain(
    selection: Selection<SVGGElement, unknown, null, undefined>,
    options: {
        size: number;
        color?: string;
    },
) {
    const {size, color} = options;

    selection
        .selectAll('.domain')
        .data([null])
        .enter()
        .insert('path', '.tick')
        .attr('class', 'domain')
        .attr('stroke', color || 'currentColor')
        .attr('d', `M0,0V0H${size}`);
}

export function axisBottom(args: AxisBottomArgs) {
    const {
        scale,
        ticks: {
            labelFormat,
            labelsPaddings = 0,
            labelsMargin = 0,
            labelsStyle,
            size: tickSize,
            count: ticksCount,
            maxTickCount,
            autoRotation = true,
        },
        domain: {size: domainSize, color: domainColor},
    } = args;
    const offset = getXAxisOffset();
    const spacing = Math.max(tickSize, 0) + labelsMargin;
    const position = getXTickPosition({scale, offset});
    const values = getXAxisItems({scale, count: ticksCount, maxCount: maxTickCount});

    return function (selection: Selection<SVGGElement, unknown, null, undefined>) {
        selection
            .selectAll('.tick')
            .data(values)
            .order()
            .join((el) => {
                const tick = el.append('g').attr('class', 'tick');
                tick.append('line').attr('stroke', 'currentColor').attr('y2', tickSize);
                tick.append('text')
                    .attr('fill', 'currentColor')
                    .attr('y', spacing)
                    .attr('dy', '0.71em')
                    .text(labelFormat);

                return tick;
            })
            .attr('transform', function (d) {
                return `translate(${position(d as AxisDomain) + offset},0)`;
            });

        const labels = selection.selectAll('.tick text');
        const labelNodes = labels.nodes() as SVGTextElement[];

        const overlapping = hasOverlappingLabels({
            width: domainSize,
            labels: values.map(labelFormat),
            padding: labelsPaddings,
            style: labelsStyle,
        });

        if (overlapping) {
            if (autoRotation) {
                const labelHeight = labelNodes[0]?.getBoundingClientRect()?.height;
                const labelOffset = (labelHeight / 2 + labelsMargin) / 2;
                labels
                    .attr('text-anchor', 'end')
                    .attr('transform', `rotate(-45) translate(-${labelOffset}, -${labelOffset})`);
            } else {
                // remove overlapping labels
                let elementX = 0;
                selection
                    .selectAll('.tick')
                    .filter(function () {
                        const node = this as unknown as Element;
                        const r = node.getBoundingClientRect();

                        if (r.left < elementX) {
                            return true;
                        }
                        elementX = r.right + labelsPaddings;
                        return false;
                    })
                    .remove();
            }
        }

        selection.call(addDomain, {size: domainSize, color: domainColor});

        selection.attr('text-anchor', 'middle').style('font-size', labelsStyle?.fontSize || '');
    };
}
