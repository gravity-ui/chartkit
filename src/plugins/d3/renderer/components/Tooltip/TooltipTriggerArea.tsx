import React from 'react';
import throttle from 'lodash/throttle';
import {bisector, pointer, sort} from 'd3';
import type {Dispatch} from 'd3';

import type {ShapeData, PreparedBarXData, PointerPosition} from '../../hooks';
import {extractD3DataFromNode, isNodeContainsD3Data} from '../../utils';
import type {NodeWithD3Data} from '../../utils';

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
    if (shapesData.every((d) => d.series.type === 'bar-x')) {
        return 'x-primary';
    }

    return 'none';
};

export const TooltipTriggerArea = (args: Args) => {
    const {boundsWidth, boundsHeight, dispatcher, offsetTop, offsetLeft, shapesData, svgContainer} =
        args;
    const rectRef = React.useRef<SVGRectElement>(null);
    const calculationType = React.useMemo(() => {
        return getCalculationType(shapesData);
    }, [shapesData]);
    const xData = React.useMemo(() => {
        return calculationType === 'x-primary'
            ? sort(new Set((shapesData as PreparedBarXData[]).map((d) => d.x)))
            : [];
    }, [shapesData, calculationType]);

    const handleXprimaryMouseMove: React.MouseEventHandler<SVGRectElement> = (e) => {
        const {left, top} = rectRef.current?.getBoundingClientRect() || {left: 0, top: 0};
        const [pointerX, pointerY] = pointer(e, svgContainer);
        const barWidthOffset = (shapesData[0] as PreparedBarXData).width / 2;
        const xPosition = pointerX - left - barWidthOffset - window.pageXOffset;
        const xDataIndex = bisector((d) => d).center(xData, xPosition);
        const xNodes = Array.from(
            rectRef.current?.parentElement?.querySelectorAll(`[x="${xData[xDataIndex]}"]`) || [],
        );

        let hoverShapeData: ShapeData[] | undefined;

        if (xNodes.length === 1 && isNodeContainsData(xNodes[0])) {
            hoverShapeData = [extractD3DataFromNode(xNodes[0])];
        } else if (xNodes.length > 1 && xNodes.every(isNodeContainsData)) {
            const yPosition = pointerY - top - window.pageYOffset;
            const xyNode = xNodes.find((node, i) => {
                const {y, height} = extractD3DataFromNode(node) as PreparedBarXData;
                if (i === xNodes.length - 1) {
                    return yPosition <= y + height;
                }
                return yPosition >= y && yPosition <= y + height;
            });

            if (xyNode) {
                hoverShapeData = [extractD3DataFromNode(xyNode)];
            }
        }

        if (hoverShapeData) {
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
