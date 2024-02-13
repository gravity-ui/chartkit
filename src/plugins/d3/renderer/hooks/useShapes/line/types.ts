import {DashStyle, LineCap} from '../../../../../../constants';
import {LineSeriesData} from '../../../../../../types';
import {LabelData} from '../../../types';
import {PreparedLineSeries} from '../../useSeries/types';

export type PointData = {
    x: number;
    y: number;
    data: LineSeriesData;
    series: PreparedLineSeries;
};

export type MarkerData = {
    point: PointData;
    active: boolean;
    hovered: boolean;
};

export type PreparedLineData = {
    id: string;
    points: PointData[];
    markers: MarkerData[];
    color: string;
    width: number;
    series: PreparedLineSeries;
    hovered: boolean;
    active: boolean;
    labels: LabelData[];
    dashStyle: DashStyle;
    linecap: LineCap;
};
