import {Selection} from 'd3-selection';

export function setEllipsisForOverflowText(
    selection: Selection<SVGTextElement, any, null, undefined>,
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
