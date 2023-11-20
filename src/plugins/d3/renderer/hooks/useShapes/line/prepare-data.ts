import {PreparedLineSeries} from '../../useSeries/types';
import {PreparedAxis} from '../../useChartOptions/types';
import {ChartScale} from '../../useAxisScales';
import {PointData, PreparedLineData} from './types';
import {getXValue, getYValue} from '../utils';
import {getLabelsSize, getLeftPosition} from '../../../utils';
import type {LabelData} from '../../../types';

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
    };

    const left = getLeftPosition(labelData);
    if (left < 0) {
        labelData.x = labelData.x - left;
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
    yScale: ChartScale;
}): PreparedLineData[] => {
    const {series, xAxis, xScale, yScale} = args;
    const yAxis = args.yAxis[0];
    const [_xMin, xRangeMax] = xScale.range();
    const xMax = xRangeMax / (1 - xAxis.maxPadding);

    return series.reduce<PreparedLineData[]>((acc, s) => {
        const points = s.data.map((d) => ({
            x: getXValue({point: d, xAxis, xScale}),
            y: getYValue({point: d, yAxis, yScale}),
            data: d,
        }));

        let labels: LabelData[] = [];
        if (s.dataLabels.enabled) {
            labels = points.map<LabelData>((p) => getLabelData(p, s, xMax));
        }

        acc.push({
            points,
            labels,
            color: s.color,
            width: s.lineWidth,
            series: s,
            hovered: false,
            active: true,
            id: s.id,
        });

        return acc;
    }, []);
};
