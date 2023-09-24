import React from 'react';
import throttle from 'lodash/throttle';
import {bisector, pointer, sort} from 'd3';
import type {Dispatch} from 'd3';

import type {ChartScale, ShapeData, PreparedBarXData, PointerPosition} from '../../hooks';

type Args = {
    boundsWidth: number;
    boundsHeight: number;
    dispatcher: Dispatch<object>;
    offsetTop: number;
    offsetLeft: number;
    shapesData: ShapeData[];
    svgContainer: SVGSVGElement | null;
    xScale?: ChartScale;
};

type CalculationType = 'x-primary' | 'none';

// https://d3js.org/d3-selection/joining#selection_data
const isNodeContainsData = (node?: Element): node is Element & {__data__: ShapeData} => {
    return Boolean(node && '__data__' in node);
};

const getCalculationType = (shapesData: ShapeData[]): CalculationType => {
    if (shapesData.every((d) => d.series.type === 'bar-x')) {
        return 'x-primary';
    }

    return 'none';
};

export const TooltipTriggerArea = (args: Args) => {
    const {
        boundsWidth,
        boundsHeight,
        dispatcher,
        offsetTop,
        offsetLeft,
        shapesData,
        svgContainer,
        xScale,
    } = args;
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
        const [x, y] = pointer(e, svgContainer);
        const isXLinearOrTimeScale = xScale && 'invert' in xScale;
        const xPosition = x - left - (isXLinearOrTimeScale ? 0 : offsetLeft);
        const xDataIndex = bisector((d) => d).center(xData, xPosition);
        const xNodes = Array.from(
            rectRef.current?.parentElement?.querySelectorAll(`[x="${xData[xDataIndex]}"]`) || [],
        );

        let hoverShapeData: ShapeData[] | undefined;

        if (xNodes.length === 1 && isNodeContainsData(xNodes[0])) {
            hoverShapeData = [xNodes[0].__data__];
        } else if (xNodes.length > 1 && xNodes.every(isNodeContainsData)) {
            const yData = xNodes.map((node) => (node.__data__ as PreparedBarXData).y);
            const yPosition = y - top;
            const yDataIndex = bisector((d) => d).center(yData, yPosition);

            if (xNodes[yDataIndex]) {
                xNodes.reverse();
                hoverShapeData = [xNodes[yDataIndex].__data__];
            }
        }

        if (hoverShapeData) {
            const position: PointerPosition = [x - offsetLeft, y - offsetTop];
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

    const throttledHandleMouseMove = throttle(handleMouseMove, 50);

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
