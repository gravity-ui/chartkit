import React from 'react';

import {bisector, group, pointer, sort} from 'd3';
import type {Dispatch} from 'd3';
import get from 'lodash/get';
import throttle from 'lodash/throttle';

import {BarYSeriesData, LineSeriesData} from '../../../../../types';
import type {PointerPosition, PreparedBarXData, PreparedSeries, ShapeData} from '../../hooks';
import {PreparedBarYData} from '../../hooks/useShapes/bar-y/types';
import {PreparedLineData} from '../../hooks/useShapes/line/types';
import {extractD3DataFromNode, isNodeContainsD3Data} from '../../utils';
import type {NodeWithD3Data} from '../../utils';

const THROTTLE_DELAY = 50;

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    dispatcher: Dispatch<object>;
    shapesData: ShapeData[];
    svgContainer: SVGSVGElement | null;
};

const isNodeContainsData = (node?: Element): node is NodeWithD3Data<ShapeData> => {
    return isNodeContainsD3Data(node);
};

function getBarXShapeData(args: {
    shapesData: ShapeData[];
    point: number[];
    top: number;
    left: number;
    xData: {x: number; data: ShapeData}[];
    container?: HTMLElement | null;
}) {
    const {
        shapesData,
        point: [pointerX, pointerY],
        top,
        left,
        xData,
        container,
    } = args;
    const barWidthOffset = (shapesData[0] as PreparedBarXData).width / 2;
    const xPosition = pointerX - left - barWidthOffset;
    const xDataIndex = bisector((d: {x: number; data: ShapeData}) => d.x).center(xData, xPosition);
    const xNodes = Array.from(container?.querySelectorAll(`[x="${xData[xDataIndex]?.x}"]`) || []);

    if (xNodes.length === 1 && isNodeContainsData(xNodes[0])) {
        return [extractD3DataFromNode(xNodes[0])];
    }

    if (xNodes.length > 1 && xNodes.every(isNodeContainsData)) {
        const yPosition = pointerY - top;
        const xyNode = xNodes.find((node, i) => {
            const {y, height} = extractD3DataFromNode(node) as PreparedBarXData;
            if (i === xNodes.length - 1) {
                return yPosition <= y + height;
            }
            return yPosition >= y && yPosition <= y + height;
        });

        if (xyNode) {
            return [extractD3DataFromNode(xyNode)];
        }
    }

    return [];
}

type XLineData = {x: number; data: LineSeriesData; series: PreparedSeries};

function getLineShapesData(args: {xData: XLineData[]; point: number[]}) {
    const {
        xData,
        point: [pointerX],
    } = args;
    const xDataIndex = bisector((d: {x: number}) => d.x).center(xData, pointerX);
    const selectedLineShape = xData[xDataIndex];

    if (selectedLineShape) {
        return [
            {
                series: selectedLineShape.series,
                data: selectedLineShape.data,
            },
        ];
    }

    return [];
}

type BarYData = {
    y: number;
    items: {x: number; data: BarYSeriesData; series: PreparedSeries}[];
};

function getBarYData(args: {data: BarYData[]; point: number[]}) {
    const {
        data,
        point: [pointerX, pointerY],
    } = args;
    const yDataIndex = bisector((d: {y: number}) => d.y).center(data, pointerY);
    const shapesByY = data[yDataIndex]?.items || [];
    const xDataIndex = bisector((d: {x: number}) => d.x).left(shapesByY, pointerX);
    const result = shapesByY[Math.min(xDataIndex, shapesByY.length - 1)];

    return result
        ? [
              {
                  series: result.series,
                  data: result.data,
              },
          ]
        : [];
}

export const TooltipTriggerArea = (args: Args) => {
    const {boundsWidth, boundsHeight, dispatcher, shapesData, svgContainer} = args;
    const rectRef = React.useRef<SVGRectElement>(null);
    const xBarData = React.useMemo(() => {
        const result = shapesData
            .filter((sd) => get(sd, 'series.type') === 'bar-x')
            .map((sd) => ({x: (sd as PreparedBarXData).x, data: sd}));

        return sort(result, (item) => item.x);
    }, [shapesData]);

    const xLineData = React.useMemo(() => {
        const result = shapesData
            .filter((sd) => ['line', 'area'].includes((sd as PreparedLineData).series.type))
            .reduce((acc, sd) => {
                return acc.concat(
                    (sd as PreparedLineData).points.map<XLineData>((d) => ({
                        x: d.x,
                        data: d.data,
                        series: d.series,
                    })),
                );
            }, [] as XLineData[]);

        return sort(result, (item) => item.x);
    }, [shapesData]);

    const barYData = React.useMemo(() => {
        const barYShapeData = shapesData.filter((sd) => get(sd, 'series.type') === 'bar-y');
        const result = Array.from(group(barYShapeData, (sd) => (sd as PreparedBarYData).y)).map(
            ([y, shapes]) => {
                const yValue = y + (shapes[0] as PreparedBarYData).height / 2;

                return {
                    y: yValue,
                    items: sort(
                        shapes.map((shape) => {
                            const preparedData = shape as PreparedBarYData;

                            return {
                                x: preparedData.x + preparedData.width,
                                data: preparedData.data,
                                series: preparedData.series,
                            };
                        }),
                        (item) => item.x,
                    ),
                };
            },
        );

        return sort(result, (item) => item.y);
    }, [shapesData]);

    const getShapeData = (point: [number, number]) => {
        const {left: ownLeft, top: ownTop} = rectRef.current?.getBoundingClientRect() || {
            left: 0,
            top: 0,
        };
        const {left: containerLeft, top: containerTop} = svgContainer?.getBoundingClientRect() || {
            left: 0,
            top: 0,
        };
        const [pointerX, pointerY] = point; //pointer(e, svgContainer);
        const result = [];

        result?.push(
            ...getBarXShapeData({
                shapesData,
                point: [pointerX, pointerY],
                left: ownLeft - containerLeft,
                top: ownTop - containerTop,
                xData: xBarData,
                container: rectRef.current?.parentElement,
            }),
            ...getLineShapesData({
                xData: xLineData,
                point: [pointerX - (ownLeft - containerLeft), pointerY - (ownTop - containerTop)],
            }),
            ...getBarYData({
                data: barYData,
                point: [pointerX - (ownLeft - containerLeft), pointerY - (ownTop - containerTop)],
            }),
        );

        return result;
    };

    const handleMouseMove: React.MouseEventHandler<SVGRectElement> = (e) => {
        const [pointerX, pointerY] = pointer(e, svgContainer);
        const hoverShapeData = getShapeData([pointerX, pointerY]);

        if (hoverShapeData.length) {
            const position: PointerPosition = [pointerX, pointerY];
            dispatcher.call('hover-shape', e.target, hoverShapeData, position);
        }
    };

    const throttledHandleMouseMove = throttle(handleMouseMove, THROTTLE_DELAY);

    const handleMouseLeave = () => {
        throttledHandleMouseMove.cancel();
        dispatcher.call('hover-shape', {}, undefined);
    };

    const handleClick: React.MouseEventHandler<SVGRectElement> = (e) => {
        const [pointerX, pointerY] = pointer(e, svgContainer);
        const shapeData = getShapeData([pointerX, pointerY]);

        if (shapeData.length) {
            dispatcher.call(
                'click-chart',
                undefined,
                {point: get(shapeData, '[0].data'), series: get(shapeData, '[0].series')},
                e,
            );
        }
    };

    return (
        <rect
            ref={rectRef}
            width={boundsWidth}
            height={boundsHeight}
            fill="transparent"
            onMouseMove={throttledHandleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        />
    );
};
