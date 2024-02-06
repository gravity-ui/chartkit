import {stratify} from 'd3';

import {getRandomCKId} from '../../../../../../utils';

import type {PreparedTreemapSeries} from '../../useSeries/types';
import type {PreparedTreemapData, PreparedTreemapSeriesData} from './types';

export function prepareTreemapData(args: {series: PreparedTreemapSeries}): PreparedTreemapData {
    const {series} = args;
    const dataWithRootNode = getSeriesDataWithRootNode(series);
    const hierarchy = stratify<PreparedTreemapSeriesData>()
        .id((d) => d.id || d.name)
        .parentId((d) => d.parent)(dataWithRootNode);

    return {hierarchy, series};
}

function getSeriesDataWithRootNode(series: PreparedTreemapSeries) {
    return series.data.reduce<PreparedTreemapSeriesData[]>(
        (acc, d) => {
            const dataChunk = Object.assign({_nodeId: getRandomCKId()}, d);

            if (!dataChunk.parent) {
                dataChunk.parent = series.id;
            }

            acc.push(dataChunk);

            return acc;
        },
        // We do not need _nodeId in root
        [{name: series.name, id: series.id} as PreparedTreemapSeriesData],
    );
}
