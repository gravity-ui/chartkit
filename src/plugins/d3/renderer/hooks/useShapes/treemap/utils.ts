import type {HierarchyRectangularNode} from 'd3';

import type {TreemapLabelData, PreparedTreemapSeriesData} from './types';

export function getLabelData(
    data: HierarchyRectangularNode<PreparedTreemapSeriesData>[],
): TreemapLabelData[] {
    return data.map((d) => {
        const text = d.data.name;
        return {text, id: d.data._nodeId, x: d.x0, y: d.y0, width: d.x1 - d.x0};
    });
}
