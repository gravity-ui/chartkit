import React from 'react';
import throttle from 'lodash/throttle';
import {bisector, pointer, sort} from 'd3';
import type {Dispatch} from 'd3';

import type {ShapeData, PreparedBarXData, PointerPosition, PreparedSeries} from '../../hooks';
import {extractD3DataFromNode, isNodeContainsD3Data} from '../../utils';
import type {NodeWithD3Data} from '../../utils';
import {PreparedLineData} from '../../hooks/useShapes/line/types';
import {LineSeriesData} from '../../../../../types';

const THROTTLE_DELAY = 50;

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    dispatcher: Dispatch<object>;
    offsetTop: number;
    offsetLeft: number;
    shapesData: ShapeData[];
    svgContainer: SVGSVGElement | null;
};

type CalculationType = 'x-primary' | 'none';

const isNodeContainsData = (node?: Element): node is NodeWithD3Data<ShapeData> => {
    return isNodeContainsD3Data(node);
};

const getCalculationType = (shapesData: ShapeData[]): CalculationType => {
    if (shapesData.every((d) => ['bar-x', 'line'].includes(d.series.type))) {
        return 'x-primary';
    }

    return 'none';
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
    const xPosition = pointerX - left - barWidthOffset - window.pageXOffset;
    const xDataIndex = bisector((d: {x: number; data: ShapeData}) => d.x).center(xData, xPosition);
    const xNodes = Array.from(container?.querySelectorAll(`[x="${xData[xDataIndex]?.x}"]`) || []);

    if (xNodes.length === 1 && isNodeContainsData(xNodes[0])) {
        return [extractD3DataFromNode(xNodes[0])];
    }

    if (xNodes.length > 1 && xNodes.every(isNodeContainsData)) {
        const yPosition = pointerY - top - window.pageYOffset;
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

function getLineShapesData(args: {
    xData: {x: number; data: LineSeriesData; series: PreparedSeries}[];
    point: number[];
}) {
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

export const TooltipTriggerArea = (args: Args) => {
    const {boundsWidth, boundsHeight, dispatcher, offsetTop, offsetLeft, shapesData, svgContainer} =
        args;
    const rectRef = React.useRef<SVGRectElement>(null);
    const calculationType = React.useMemo(() => {
        return getCalculationType(shapesData);
    }, [shapesData]);
    const xBarData = React.useMemo(() => {
        const result = shapesData
            .filter((sd) => sd.series.type === 'bar-x')
            .map((sd) => ({x: (sd as PreparedBarXData).x, data: sd}));

        return sort(result, (item) => item.x);
    }, [shapesData, calculationType]);

    const xLineData = React.useMemo(() => {
        const result = shapesData
            .filter((sd) => sd.series.type === 'line')
            .map((sd) =>
                (sd as PreparedLineData).points.map((d) => ({
                    x: d.x,
                    data: d.data,
                    series: sd.series,
                })),
            )
            .flat(2);

        return sort(result, (item) => item.x);
    }, [shapesData, calculationType]);

    const handleXprimaryMouseMove: React.MouseEventHandler<SVGRectElement> = (e) => {
        const {left, top} = rectRef.current?.getBoundingClientRect() || {left: 0, top: 0};
        const [pointerX, pointerY] = pointer(e, svgContainer);
        const hoverShapeData = [];

        hoverShapeData?.push(
            ...getBarXShapeData({
                shapesData,
                point: [pointerX, pointerY],
                left,
                top,
                xData: xBarData,
                container: rectRef.current?.parentElement,
            }),
            ...getLineShapesData({xData: xLineData, point: [pointerX, pointerY]}),
        );

        if (hoverShapeData.length) {
            const position: PointerPosition = [pointerX - offsetLeft, pointerY - offsetTop];
            dispatcher.call('hover-shape', e.target, hoverShapeData, position);
        }
    };

    const handleMouseMove: React.MouseEventHandler<SVGRectElement> = (e) => {
        switch (calculationType) {
            case 'x-primary': {
                handleXprimaryMouseMove(e);
                return;
            }
        }
    };

    const throttledHandleMouseMove = throttle(handleMouseMove, THROTTLE_DELAY);

    const handleMouseLeave = () => {
        throttledHandleMouseMove.cancel();
        dispatcher.call('hover-shape', {}, undefined);
    };

    return (
        <rect
            ref={rectRef}
            width={boundsWidth}
            height={boundsHeight}
            fill="transparent"
            onMouseMove={throttledHandleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    );
};
