import {AreaSeriesData} from '../../../../../../types';
import {HtmlItem, LabelData} from '../../../types';
import {PreparedAreaSeries} from '../../useSeries/types';

export type PointData = {
    y0: number;
    x: number;
    y: number;
    data: AreaSeriesData;
    series: PreparedAreaSeries;
};

export type MarkerData = {
    point: PointData;
    active: boolean;
    hovered: boolean;
};

export type PreparedAreaData = {
    id: string;
    points: PointData[];
    markers: MarkerData[];
    color: string;
    opacity: number;
    width: number;
    series: PreparedAreaSeries;
    hovered: boolean;
    active: boolean;
    labels: LabelData[];
    htmlElements: HtmlItem[];
};
