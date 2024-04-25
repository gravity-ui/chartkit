import {Delaunay, bisector, sort} from 'd3';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';

import {
    AreaSeries,
    BarXSeries,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesData,
    LineSeries,
    TooltipDataChunk,
    TreemapSeries,
} from '../../../../types';
import {PreparedBarXData, PreparedScatterData, ShapeData} from '../hooks';
import {PreparedAreaData} from '../hooks/useShapes/area/types';
import {PreparedBarYData} from '../hooks/useShapes/bar-y/types';
import {PreparedLineData} from '../hooks/useShapes/line/types';
import {PreparedPieData} from '../hooks/useShapes/pie/types';
import {PreparedTreemapData} from '../hooks/useShapes/treemap/types';

type GetClosestPointsArgs = {
    position: [number, number];
    shapesData: ShapeData[];
};

export type ShapePoint = {
    x: number;
    y0: number;
    y1: number;
    data: ChartKitWidgetSeriesData;
    series: ChartKitWidgetSeries;
};

function getClosestPointsByXValue(x: number, y: number, points: ShapePoint[]) {
    const sorted = sort(points, (p) => p.x);
    const closestXIndex = bisector<ShapePoint, number>((p) => p.x).center(sorted, x);
    const closestX = sorted[closestXIndex]?.x;
    const closestPoints = sort(
        points.filter((p) => p.x === closestX),
        (p) => p.y0,
    );

    let closestYIndex = -1;
    if (y < closestPoints[0]?.y0) {
        closestYIndex = 0;
    } else if (y > closestPoints[closestPoints.length - 1]?.y1) {
        closestYIndex = closestPoints.length - 1;
    } else {
        closestYIndex = closestPoints.findIndex((p) => y > p.y0 && y < p.y1);
    }

    return closestPoints.map((p, i) => ({
        data: p.data,
        series: p.series,
        closest: i === closestYIndex,
    }));
}

function getSeriesType(shapeData: ShapeData) {
    return get(shapeData, 'series.type') || get(shapeData, 'point.series.type');
}

export function getClosestPoints(args: GetClosestPointsArgs): TooltipDataChunk[] {
    const {position, shapesData} = args;
    const [pointerX, pointerY] = position;

    let result: TooltipDataChunk[] = [];

    const groups = groupBy(shapesData, getSeriesType);
    Object.entries(groups).forEach(([seriesType, list]) => {
        switch (seriesType) {
            case 'bar-x': {
                const points = (list as PreparedBarXData[]).map<ShapePoint>((d) => ({
                    data: d.data,
                    series: d.series as BarXSeries,
                    x: d.x + d.width / 2,
                    y0: d.y,
                    y1: d.y + d.height,
                }));
                result = result.concat(
                    getClosestPointsByXValue(pointerX, pointerY, points) as TooltipDataChunk[],
                );

                break;
            }
            case 'area': {
                const points = (list as PreparedAreaData[]).reduce<ShapePoint[]>((acc, d) => {
                    return acc.concat(
                        d.points.map((p) => ({
                            data: p.data,
                            series: p.series as AreaSeries,
                            x: p.x,
                            y0: p.y0,
                            y1: p.y,
                        })),
                    );
                }, []);
                result = result.concat(
                    getClosestPointsByXValue(pointerX, pointerY, points) as TooltipDataChunk[],
                );
                break;
            }
            case 'line': {
                const points = (list as PreparedLineData[]).reduce<ShapePoint[]>((acc, d) => {
                    return acc.concat(
                        d.points.map((p) => ({
                            data: p.data,
                            series: p.series as LineSeries,
                            x: p.x,
                            y0: p.y,
                            y1: p.y,
                        })),
                    );
                }, []);
                result = result.concat(
                    getClosestPointsByXValue(pointerX, pointerY, points) as TooltipDataChunk[],
                );
                break;
            }
            case 'bar-y': {
                const points = list as PreparedBarYData[];
                const sorted = sort(points, (p) => p.y);
                const closestYIndex = bisector<PreparedBarYData, number>((p) => p.y).center(
                    sorted,
                    pointerY,
                );
                const closestY = sorted[closestYIndex]?.y;
                const closestPoints = sort(
                    points.filter((p) => p.y === closestY),
                    (p) => p.x,
                );

                let closestXIndex = -1;
                const lastPoint = closestPoints[closestPoints.length - 1];
                if (pointerX < closestPoints[0]?.x) {
                    closestXIndex = 0;
                } else if (lastPoint && pointerX > lastPoint.x + lastPoint.width) {
                    closestXIndex = closestPoints.length - 1;
                } else {
                    closestXIndex = closestPoints.findIndex(
                        (p) => pointerX > p.x && pointerX < p.x + p.width,
                    );
                }
                const chunks = closestPoints.map((p, i) => ({
                    data: p.data,
                    series: p.series,
                    closest: i === closestXIndex,
                }));
                result = result.concat(chunks as TooltipDataChunk[]);
                break;
            }
            case 'scatter': {
                const points = list as PreparedScatterData[];
                const delaunayX = Delaunay.from(
                    points,
                    (d) => d.point.x,
                    (d) => d.point.y,
                );
                const closestPoint = points[delaunayX.find(pointerX, pointerY)];
                result = result.concat([
                    {
                        data: closestPoint.point.data,
                        series: closestPoint.point.series,
                        closest: true,
                    },
                ]);
                break;
            }
            case 'pie': {
                const points = (list as PreparedPieData[]).map((d) => d.segments).flat();
                const closestPoint = points.find((p) => {
                    const {center, radius} = p.data.pie;
                    const x = pointerX - center[0];
                    const y = pointerY - center[1];
                    let angle = Math.atan2(y, x) + 0.5 * Math.PI;
                    angle = angle < 0 ? Math.PI * 2 + angle : angle;
                    const polarRadius = Math.sqrt(x * x + y * y);

                    return angle >= p.startAngle && angle <= p.endAngle && polarRadius < radius;
                });

                if (closestPoint) {
                    result = result.concat([
                        {
                            data: closestPoint.data.series.data,
                            series: closestPoint.data.series,
                            closest: true,
                        },
                    ]);
                }

                break;
            }
            case 'treemap': {
                const data = list as unknown as PreparedTreemapData[];
                const closestPoint = data[0]?.leaves.find((l) => {
                    return (
                        pointerX >= l.x0 && pointerX <= l.x1 && pointerY >= l.y0 && pointerY <= l.y1
                    );
                });
                if (closestPoint) {
                    result.push({
                        data: closestPoint.data,
                        series: data[0].series as TreemapSeries,
                        closest: true,
                    });
                }

                break;
            }
        }
    });

    return result;
}
