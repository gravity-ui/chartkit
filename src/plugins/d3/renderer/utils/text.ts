import type {BaseType, Selection} from 'd3';
import {select} from 'd3';
import {BaseTextStyle} from '../../../../types';

export function setEllipsisForOverflowText<T>(
    selection: Selection<SVGTextElement, T, null, unknown>,
    maxWidth: number,
) {
    let text = selection.text();
    selection.text(null).append('title').text(text);
    const tSpan = selection.append('tspan').text(text).style('alignment-baseline', 'inherit');

    let textLength = tSpan.node()?.getBoundingClientRect()?.width || 0;

    while (textLength > maxWidth && text.length > 1) {
        text = text.slice(0, -1);
        tSpan.text(text + '…');
        textLength = tSpan.node()?.getBoundingClientRect()?.width || 0;
    }
}

export function setEllipsisForOverflowTexts<T>(
    selection: Selection<BaseType, T, any, unknown>,
    maxWidth: ((datum: T) => number) | number,
) {
    selection.each(function (datum) {
        const textMaxWidth = typeof maxWidth === 'function' ? maxWidth(datum) : maxWidth;
        setEllipsisForOverflowText(select(this as SVGTextElement), textMaxWidth);
    });
}

export function hasOverlappingLabels({
    width,
    labels,
    padding = 0,
    style,
}: {
    width: number;
    labels: string[];
    style?: BaseTextStyle;
    padding?: number;
}) {
    const maxWidth = (width - padding * (labels.length - 1)) / labels.length;

    const textElement = select(document.body)
        .append('text')
        .style('font-size', style?.fontSize || '');

    const result = labels.some((label) => {
        const textWidth = textElement.text(label).node()?.getBoundingClientRect()?.width || 0;
        return textWidth > maxWidth;
    });

    textElement.remove();

    return result;
}

function renderLabels(
    selection: Selection<SVGSVGElement, unknown, null, undefined>,
    {
        labels,
        style = {},
        attrs = {},
    }: {
        labels: string[];
        style?: Partial<BaseTextStyle>;
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
}: {
    labels: string[];
    style?: BaseTextStyle;
    rotation?: number;
}) {
    const container = select(document.body)
        .append('div')
        .attr('class', 'chartkit chartkit-theme_common');
    const svg = container.append('svg');
    const textSelection = renderLabels(svg, {labels, style});
    if (rotation) {
        textSelection
            .attr('text-anchor', rotation > 0 ? 'start' : 'end')
            .style('transform', `rotate(${rotation}deg)`);
    }

    const {height = 0, width = 0} =
        (svg.select('g').node() as Element)?.getBoundingClientRect() || {};
    container.remove();

    return {maxHeight: height, maxWidth: width};
}
