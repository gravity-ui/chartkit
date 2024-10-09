import {
    stratify,
    treemap,
    treemapBinary,
    treemapDice,
    treemapSlice,
    treemapSliceDice,
    treemapSquarify,
} from 'd3';
import type {HierarchyRectangularNode} from 'd3';

import {LayoutAlgorithm} from '../../../../../../constants';
import type {TreemapSeriesData} from '../../../../../../types';
import type {PreparedTreemapSeries} from '../../useSeries/types';

import type {PreparedTreemapData, TreemapLabelData} from './types';

const DEFAULT_PADDING = 1;

function getLabelData(data: HierarchyRectangularNode<TreemapSeriesData>[]): TreemapLabelData[] {
    return data.map((d) => {
        const text = d.data.name;

        return {
            text,
            x: d.x0,
            y: d.y0,
            width: d.x1 - d.x0,
            nodeData: d.data,
        };
    });
}

export function prepareTreemapData(args: {
    series: PreparedTreemapSeries;
    width: number;
    height: number;
}): PreparedTreemapData {
    const {series, width, height} = args;
    const dataWithRootNode = getSeriesDataWithRootNode(series);
    const hierarchy = stratify<TreemapSeriesData>()
        .id((d) => d.id || d.name)
        .parentId((d) => d.parentId)(dataWithRootNode)
        .sum((d) => d.value || 0);
    const treemapInstance = treemap<TreemapSeriesData>();

    switch (series.layoutAlgorithm) {
        case LayoutAlgorithm.Binary: {
            treemapInstance.tile(treemapBinary);
            break;
        }
        case LayoutAlgorithm.Dice: {
            treemapInstance.tile(treemapDice);
            break;
        }
        case LayoutAlgorithm.Slice: {
            treemapInstance.tile(treemapSlice);
            break;
        }
        case LayoutAlgorithm.SliceDice: {
            treemapInstance.tile(treemapSliceDice);
            break;
        }
        case LayoutAlgorithm.Squarify: {
            treemapInstance.tile(treemapSquarify);
            break;
        }
    }

    const root = treemapInstance.size([width, height]).paddingInner((d) => {
        const levelOptions = series.levels?.find((l) => l.index === d.depth + 1);
        return levelOptions?.padding ?? DEFAULT_PADDING;
    })(hierarchy);
    const leaves = root.leaves();
    const labelData: TreemapLabelData[] = series.dataLabels?.enabled ? getLabelData(leaves) : [];

    return {labelData, leaves, series, htmlElements: []};
}

function getSeriesDataWithRootNode(series: PreparedTreemapSeries) {
    return series.data.reduce<TreemapSeriesData[]>(
        (acc, d) => {
            const dataChunk = Object.assign({}, d);

            if (!dataChunk.parentId) {
                dataChunk.parentId = series.id;
            }

            acc.push(dataChunk);

            return acc;
        },
        [{name: series.name, id: series.id}],
    );
}
