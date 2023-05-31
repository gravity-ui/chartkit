import orderBy from 'lodash/orderBy';
import type {TooltipData, TooltipLine} from './types';

export const escapeHTML = (html = '') => {
    const elem = document.createElement('span');
    elem.innerText = html;

    return elem.innerHTML;
};

export const getSortedLines = (lines: TooltipLine[], sort: TooltipData['sort'] = {}) => {
    const {enabled = false, order = 'desc', iteratee} = sort;

    if (!enabled) {
        return [...lines];
    }

    return typeof iteratee === 'function'
        ? orderBy(lines, iteratee, order)
        : orderBy(lines, 'originalValue', order);
};
