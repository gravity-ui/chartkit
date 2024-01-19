import type {PieArcDatum} from 'd3';

import {PreparedPieSeries} from '../../useSeries/types';
import {LabelData} from '../../../types';
import {ConnectorCurve} from '../../../../../../types';

export type SegmentData = {
    value: number;
    color: string;
    series: PreparedPieSeries;
    hovered: boolean;
    active: boolean;
    pie: PreparedPieData;
};

export type PieLabelData = LabelData & {
    connector: {
        points: [number, number][];
        color: string;
    };
    segment: SegmentData;
    angle: number;
    maxWidth: number;
};

export type PreparedPieData = {
    id: string;
    segments: PieArcDatum<SegmentData>[];
    labels: PieLabelData[];
    center: [number, number];
    radius: number;
    innerRadius: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    series: PreparedPieSeries;
    connectorCurve: ConnectorCurve;
    halo: {
        enabled: boolean;
        opacity: number;
        size: number;
    };
};