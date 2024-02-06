import {stratify} from 'd3';

import {getRandomCKId} from '../../../../../../utils';

import type {PreparedTreemapSeries} from '../../useSeries/types';
import type {PreparedTreemapData, PreparedTreemapSeriesData} from './types';

export function prepareTreemapData(args: {series: PreparedTreemapSeries}): PreparedTreemapData {
    const {series} = args;
    const dataWithRootNode = getSeriesDataWithRootNode(series);
    const hierarchy = stratify<PreparedTreemapSeriesData>()
        .id((d) => d.id || d.name)
        .parentId((d) => d.parentId)(dataWithRootNode)
        .sum((d) => d.value || 0);

    return {hierarchy, series};
}

function getSeriesDataWithRootNode(series: PreparedTreemapSeries) {
    return series.data.reduce<PreparedTreemapSeriesData[]>(
        (acc, d) => {
            const dataChunk = Object.assign({_nodeId: getRandomCKId()}, d);

            if (!dataChunk.parentId) {
                dataChunk.parentId = series.id;
            }

            acc.push(dataChunk);

            return acc;
        },
        // We do not need _nodeId in root
        [{name: series.name, id: series.id} as PreparedTreemapSeriesData],
    );
}
