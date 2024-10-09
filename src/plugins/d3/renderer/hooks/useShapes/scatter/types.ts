import {ScatterSeriesData} from '../../../../../../types';
import {HtmlItem} from '../../../types';
import {PreparedScatterSeries} from '../../useSeries/types';

type PointData = {
    x: number;
    y: number;
    opacity: number | null;
    data: ScatterSeriesData;
    series: PreparedScatterSeries;
};

export type MarkerData = {
    point: PointData;
    active: boolean;
    hovered: boolean;
    htmlElements: HtmlItem[];
};

export type PreparedScatterData = MarkerData;
