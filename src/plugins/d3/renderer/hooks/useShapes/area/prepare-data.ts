import {group, sort} from 'd3';
import type {PreparedAreaSeries} from '../../useSeries/types';
import type {PreparedAxis} from '../../useChartOptions/types';
import type {ChartScale} from '../../useAxisScales';
import type {MarkerData, PointData, PreparedAreaData} from './types';
import {getXValue, getYValue} from '../utils';
import {getLabelsSize, getLeftPosition} from '../../../utils';
import type {LabelData} from '../../../types';
import type {AreaSeriesData} from '../../../../../../types';

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

function getXValues(series: PreparedAreaSeries[], xAxis: PreparedAxis, xScale: ChartScale) {
    const xValues = series.reduce<Map<string, number>>((acc, s) => {
        s.data.forEach((d) => {
            const key = String(d.x);
            if (!acc.has(key)) {
                acc.set(key, getXValue({point: d, xAxis, xScale}));
            }
        });
        return acc;
    }, new Map());

    if (xAxis.type === 'category') {
        return (xAxis.categories || []).reduce<[string, number][]>((acc, category) => {
            const xValue = xValues.get(category);
            if (typeof xValue === 'number') {
                acc.push([category, xValue]);
            }

            return acc;
        }, []);
    }

    return sort(Array.from(xValues), ([_x, xValue]) => xValue);
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

    return Array.from(group(series, (s) => s.stackId)).reduce<PreparedAreaData[]>(
        (result, [_stackId, seriesStack]) => {
            const xValues = getXValues(seriesStack, xAxis, xScale);

            const accumulatedYValues = new Map<string, number>();
            xValues.forEach(([key]) => {
                accumulatedYValues.set(key, 0);
            });

            const seriesStackData = seriesStack.reduce<PreparedAreaData[]>((acc, s) => {
                const seriesData = s.data.reduce<Map<string, AreaSeriesData>>((m, d) => {
                    return m.set(String(d.x), d);
                }, new Map());
                const points = xValues.reduce<PointData[]>((pointsAcc, [x, xValue]) => {
                    const accumulatedYValue = accumulatedYValues.get(x) || 0;
                    const d =
                        seriesData.get(x) ||
                        ({
                            x,
                            // FIXME: think about how to break the series into separate areas(null Y values)
                            y: 0,
                        } as AreaSeriesData);
                    const yValue = getYValue({point: d, yAxis, yScale}) - accumulatedYValue;
                    accumulatedYValues.set(x, yMin - yValue);

                    pointsAcc.push({
                        y0: yMin - accumulatedYValue,
                        x: xValue,
                        y: yValue,
                        data: d,
                        series: s,
                    });
                    return pointsAcc;
                }, []);

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
                    opacity: s.opacity,
                    width: s.lineWidth,
                    series: s,
                    hovered: false,
                    active: true,
                    id: s.id,
                });

                return acc;
            }, []);

            return result.concat(seriesStackData);
        },
        [],
    );
};
