import type {HierarchyNode} from 'd3';
import {TreemapSeriesData} from '../../../../../../types';
import {PreparedTreemapSeries} from '../../useSeries/types';

export type PreparedTreemapSeriesData = TreemapSeriesData & {
    _nodeId: string;
};

export type PreparedTreemapData = {
    hierarchy: HierarchyNode<PreparedTreemapSeriesData>;
    series: PreparedTreemapSeries;
};

export type TreemapLabelData = {
    id: string;
    text: string;
    x: number;
    y: number;
    width: number;
};
