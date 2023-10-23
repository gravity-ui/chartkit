import {PreparedLineSeries} from '../../useSeries/types';
import {LineSeriesData} from '../../../../../../types';

export type PointData = {
    x: number;
    y: number;
    data: LineSeriesData;
};

export type PreparedLineData = {
    id: number;
    points: PointData[];
    color: string;
    width: number;
    series: PreparedLineSeries;
    hovered: boolean;
    active: boolean;
};
