import type {LabelData} from '../../../types';
import {getLabelsSize, getLeftPosition} from '../../../utils';
import {ChartScale} from '../../useAxisScales';
import {PreparedAxis} from '../../useChartOptions/types';
import {PreparedLineSeries} from '../../useSeries/types';
import {getXValue, getYValue} from '../utils';

import {MarkerData, PointData, PreparedLineData} from './types';

function getLabelData(point: PointData, series: PreparedLineSeries, xMax: number) {
    const text = String(point.data.label || point.data.y);
    const style = series.dataLabels.style;
    const size = getLabelsSize({labels: [text], style});

    const labelData: LabelData = {
        text,
        x: point.x,
        y: point.y - series.dataLabels.padding,
        style,
        size: {width: size.maxWidth, height: size.maxHeight},
        textAnchor: 'middle',
        series: series,
        active: true,
    };

    const left = getLeftPosition(labelData);
    if (left < 0) {
        labelData.x = labelData.x + Math.abs(left);
    } else {
        const right = left + labelData.size.width;
        if (right > xMax) {
            labelData.x = labelData.x - xMax - right;
        }
    }

    return labelData;
}

export const prepareLineData = (args: {
    series: PreparedLineSeries[];
    xAxis: PreparedAxis;
    xScale: ChartScale;
    yAxis: PreparedAxis[];
    yScale: ChartScale[];
}): PreparedLineData[] => {
    const {series, xAxis, xScale, yScale} = args;
    const yAxis = args.yAxis[0];
    const [_xMin, xRangeMax] = xScale.range();
    const xMax = xRangeMax / (1 - xAxis.maxPadding);

    return series.reduce<PreparedLineData[]>((acc, s) => {
        const seriesYScale = yScale[s.yAxis];
        const points = s.data.map((d) => ({
            x: getXValue({point: d, xAxis, xScale}),
            y: getYValue({point: d, yAxis, yScale: seriesYScale}),
            active: true,
            data: d,
            series: s,
        }));

        let labels: LabelData[] = [];
        if (s.dataLabels.enabled) {
            labels = points.map<LabelData>((p) => getLabelData(p, s, xMax));
        }

        let markers: MarkerData[] = [];
        if (s.marker.states.normal.enabled || s.marker.states.hover.enabled) {
            markers = points.map<MarkerData>((p) => ({
                point: p,
                active: true,
                hovered: false,
            }));
        }

        const result: PreparedLineData = {
            points,
            markers,
            labels,
            color: s.color,
            width: s.lineWidth,
            series: s,
            hovered: false,
            active: true,
            id: s.id,
            dashStyle: s.dashStyle,
            linecap: s.linecap,
            opacity: s.opacity,
        };

        acc.push(result);

        return acc;
    }, []);
};
