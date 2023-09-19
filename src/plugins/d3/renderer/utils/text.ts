import type {Selection} from 'd3';
import {select} from 'd3';
import {BaseTextStyle} from '../../../../types';

export function setEllipsisForOverflowText(
    selection: Selection<SVGTextElement, unknown, null, unknown>,
    maxWidth: number,
) {
    let text = selection.text();
    selection.text(null).attr('text-anchor', 'left').append('title').text(text);
    const tSpan = selection.append('tspan').text(text);

    let textLength = tSpan.node()?.getComputedTextLength() || 0;
    while (textLength > maxWidth && text.length > 1) {
        text = text.slice(0, -1);
        tSpan.text(text + '…');
        textLength = tSpan.node()?.getComputedTextLength() || 0;
    }
}

export function setEllipsisForOverflowTexts(
    selection: Selection<SVGTextElement, string, any, unknown>,
    maxWidth: number,
) {
    selection.each(function () {
        setEllipsisForOverflowText(select(this), maxWidth);
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
        style,
        transform,
    }: {
        labels: string[];
        style?: BaseTextStyle;
        transform?: string;
    },
) {
    const text = selection
        .append('g')
        .append('text')
        .attr('transform', transform || '')
        .style('font-size', style?.fontSize || '');
    text.selectAll('tspan')
        .data(labels)
        .enter()
        .append('tspan')
        .attr('x', 0)
        .attr('dy', 0)
        .text((d) => d);

    return text;
}

export function getLabelsMaxWidth({
    labels,
    style,
    transform,
}: {
    labels: string[];
    style?: BaseTextStyle;
    transform?: string;
}) {
    const svg = select(document.body).append('svg');
    svg.call(renderLabels, {labels, style, transform});

    const maxWidth = (svg.select('g').node() as Element)?.getBoundingClientRect()?.width || 0;
    svg.remove();

    return maxWidth;
}

export function getLabelsMaxHeight({
    labels,
    style,
    transform,
}: {
    labels: string[];
    style?: BaseTextStyle;
    transform?: string;
}) {
    const svg = select(document.body).append('svg');
    svg.call(renderLabels, {labels, style, transform});

    const maxHeight = (svg.select('g').node() as Element)?.getBoundingClientRect()?.height || 0;
    svg.remove();

    return maxHeight;
}
