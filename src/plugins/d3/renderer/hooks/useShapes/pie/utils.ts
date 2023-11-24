import {pie} from 'd3';
import type {SegmentData} from './types';

export const pieGenerator = pie<SegmentData>()
    .value((d) => d.value)
    .sort(null);
