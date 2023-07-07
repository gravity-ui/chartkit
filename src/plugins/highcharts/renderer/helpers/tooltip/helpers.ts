import orderBy from 'lodash/orderBy';
import type {TooltipData, TooltipLine} from './types';

export const escapeHTML = (html = '') => {
    const elem = document.createElement('span');
    elem.innerText = html;

    return elem.innerHTML;
};

export const getSortedLines = (lines: TooltipLine[], sort: TooltipData['sort'] = {}) => {
    const {enabled = true, order = 'desc', iteratee = 'originalValue'} = sort;

    if (!enabled) {
        return [...lines];
    }

    return orderBy(lines, iteratee, order);
};
