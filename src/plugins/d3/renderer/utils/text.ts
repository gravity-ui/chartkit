import type {Selection} from 'd3';
import {select} from 'd3';

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
