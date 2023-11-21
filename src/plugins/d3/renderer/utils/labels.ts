import sortBy from 'lodash/sortBy';

import type {LabelData} from '../types';

export function getLeftPosition(label: LabelData) {
    switch (label.textAnchor) {
        case 'middle': {
            return label.x - label.size.width / 2;
        }
        default: {
            return label.x;
        }
    }
}

function hasOverlappingByX(rect1: LabelData, rect2: LabelData) {
    const left1 = getLeftPosition(rect1);
    const right1 = left1 + rect1.size.width;
    const left2 = getLeftPosition(rect2);
    const right2 = left2 + rect2.size.width;

    return Math.max(0, Math.min(right1, right2) - Math.max(left1, left2)) > 0;
}

function hasOverlappingByY(rect1: LabelData, rect2: LabelData) {
    const top1 = rect1.y - rect1.size.height;
    const bottom1 = rect1.y;
    const top2 = rect2.y - rect2.size.height;
    const bottom2 = rect2.y;

    return Math.max(0, Math.min(bottom1, bottom2) - Math.max(top1, top2)) > 0;
}

export function filterOverlappingLabels(labels: LabelData[]) {
    const result: LabelData[] = [];

    const sorted = sortBy(labels, (d) => d.y, getLeftPosition);
    sorted.forEach((label) => {
        if (!result.some((l) => hasOverlappingByX(l, label) && hasOverlappingByY(l, label))) {
            result.push(label);
        }
    });

    return result;
}
