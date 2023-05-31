import orderBy from 'lodash/orderBy';
import type {TooltipData, TooltipLine} from './types';

export const escapeHTML = (html = '') => {
    const elem = document.createElement('span');
    elem.innerText = html;

    return elem.innerHTML;
};

export const getSortedLines = (lines: TooltipLine[], sort: TooltipData['sort'] = {}) => {
    // set eneabled to true after https://github.com/gravity-ui/chartkit/issues/171
    const {enabled = false, order = 'desc', iteratee = 'originalValue'} = sort;

    if (!enabled) {
        return [...lines];
    }

    return orderBy(lines, iteratee, order);
};
