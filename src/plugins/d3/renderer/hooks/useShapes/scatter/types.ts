import {ScatterSeriesData} from '../../../../../../types';
import {PreparedScatterSeries} from '../../useSeries/types';

type PointData = {
    x: number;
    y: number;
    data: ScatterSeriesData;
    series: PreparedScatterSeries;
};

export type MarkerData = {
    point: PointData;
    active: boolean;
    hovered: boolean;
};

export type PreparedScatterData = MarkerData;
