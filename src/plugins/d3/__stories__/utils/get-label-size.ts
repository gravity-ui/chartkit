import type React from 'react';

import type {Selection} from 'd3';
import {select} from 'd3-selection';

function renderLabels(
    selection: Selection<SVGSVGElement, unknown, null, undefined>,
    {
        labels,
        style = {},
        attrs = {},
    }: {
        labels: string[];
        style?: Partial<React.CSSProperties>;
        attrs?: Record<string, string>;
    },
) {
    const text = selection.append('g').append('text');

    text.style('font-size', style.fontSize || '');
    text.style('font-weight', style.fontWeight || '');

    Object.entries(attrs).forEach(([name, value]) => {
        text.attr(name, value);
    });

    text.selectAll('tspan')
        .data(labels)
        .enter()
        .append('tspan')
        .attr('x', 0)
        .attr('dy', 0)
        .text((d) => d);

    return text;
}

export function getLabelsSize({
    labels,
    style,
    rotation,
    html,
}: {
    labels: string[];
    style?: React.CSSProperties;
    rotation?: number;
    html?: boolean;
}) {
    if (!labels.filter(Boolean).length) {
        return {maxHeight: 0, maxWidth: 0};
    }

    const container = select(document.body)
        .append('div')
        .attr('class', 'chartkit chartkit-theme_common');

    const result = {maxHeight: 0, maxWidth: 0};
    let labelWrapper: HTMLElement | null;
    if (html) {
        labelWrapper = container.append('div').style('position', 'absolute').node();
        const {height, width} = labels.reduce(
            (acc, l) => {
                if (labelWrapper) {
                    labelWrapper.innerHTML = l;
                }
                const rect = labelWrapper?.getBoundingClientRect();
                return {
                    width: Math.max(acc.width, rect?.width ?? 0),
                    height: Math.max(acc.height, rect?.height ?? 0),
                };
            },
            {height: 0, width: 0},
        );

        result.maxWidth = width;
        result.maxHeight = height;
    } else {
        const svg = container.append('svg');
        const textSelection = renderLabels(svg, {labels, style});
        if (rotation) {
            textSelection
                .attr('text-anchor', rotation > 0 ? 'start' : 'end')
                .style('transform', `rotate(${rotation}deg)`);
        }

        const rect = (svg.select('g').node() as Element)?.getBoundingClientRect();
        result.maxWidth = rect?.width ?? 0;
        result.maxHeight = rect?.height ?? 0;
    }

    container.remove();

    return result;
}
