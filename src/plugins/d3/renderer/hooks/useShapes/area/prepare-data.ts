import {PreparedAreaSeries} from '../../useSeries/types';
import {PreparedAxis} from '../../useChartOptions/types';
import {ChartScale} from '../../useAxisScales';
import {MarkerData, PointData, PreparedAreaData} from './types';
import {getXValue, getYValue} from '../utils';
import {getLabelsSize, getLeftPosition} from '../../../utils';
import type {LabelData} from '../../../types';

function getLabelData(point: PointData, series: PreparedAreaSeries, xMax: number) {
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

export const prepareAreaData = (args: {
    series: PreparedAreaSeries[];
    xAxis: PreparedAxis;
    xScale: ChartScale;
    yAxis: PreparedAxis[];
    yScale: ChartScale;
}): PreparedAreaData[] => {
    const {series, xAxis, xScale, yScale} = args;
    const yAxis = args.yAxis[0];
    const [_xMin, xRangeMax] = xScale.range();
    const xMax = xRangeMax / (1 - xAxis.maxPadding);
    const [yMin, _yMax] = yScale.range();

    return series.reduce<PreparedAreaData[]>((acc, s) => {
        const points = s.data.map((d) => ({
            y0: yMin,
            x: getXValue({point: d, xAxis, xScale}),
            y: getYValue({point: d, yAxis, yScale}),
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

        acc.push({
            points,
            markers,
            labels,
            color: s.color,
            opacity: 0.5,
            width: s.lineWidth,
            series: s,
            hovered: false,
            active: true,
            id: s.id,
        });

        return acc;
    }, []);
};
