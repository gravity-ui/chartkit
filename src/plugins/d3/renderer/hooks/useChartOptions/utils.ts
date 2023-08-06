import {select} from 'd3';
import get from 'lodash/get';

import type {BaseTextStyle} from '../../../../../types/widget-data';
import {DEFAULT_AXIS_LABEL_FONT_SIZE} from './constants';

export const getHorisontalSvgTextDimensions = (args: {
    text: string;
    style?: Partial<BaseTextStyle>;
}) => {
    const {text, style} = args;
    const textSelection = select(document.body).append('text').text(text);
    const fontSize = get(style, 'fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE);
    let height = 0;

    if (fontSize) {
        textSelection.style('font-size', fontSize);
    }

    textSelection
        .each(function () {
            height = this.getBoundingClientRect().height;
        })
        .remove();

    return height;
};
