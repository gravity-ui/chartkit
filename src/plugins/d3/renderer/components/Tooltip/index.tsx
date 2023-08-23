import React from 'react';

import type {TooltipHoveredData} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import type {PointerPosition, PreparedAxis, PreparedTooltip} from '../../hooks';
import {DefaultContent} from './DefaultContent';

const b = block('d3-tooltip');
const POINTER_OFFSET_X = 20;

type TooltipProps = {
    tooltip: PreparedTooltip;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
    hovered?: TooltipHoveredData;
    pointerPosition?: PointerPosition;
};

export const Tooltip = (props: TooltipProps) => {
    const {hovered, pointerPosition, tooltip, xAxis, yAxis} = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const size = React.useMemo(() => {
        if (ref.current && hovered) {
            const {width, height} = ref.current.getBoundingClientRect();
            return {width, height};
        }
        return undefined;
    }, [hovered, pointerPosition]);
    const position = React.useMemo(() => {
        if (hovered && pointerPosition && size) {
            const {clientWidth} = document.documentElement;
            const {width, height} = size;
            const [pointerLeft, pointetTop] = pointerPosition;
            const outOfRightBoudary = pointerLeft + width + POINTER_OFFSET_X >= clientWidth;
            const outOfTopBoundary = pointetTop - height / 2 <= 0;
            const left = outOfRightBoudary
                ? pointerLeft - width - POINTER_OFFSET_X
                : pointerLeft + POINTER_OFFSET_X;
            const top = outOfTopBoundary ? 0 : pointetTop - height / 2;
            return {left, top};
        } else if (hovered && pointerPosition) {
            return {left: -1000, top: -1000};
        }

        return undefined;
    }, [hovered, pointerPosition, size]);
    const content = React.useMemo(() => {
        if (tooltip.renderer && hovered) {
            return tooltip.renderer({hovered});
        } else if (hovered) {
            return <DefaultContent hovered={hovered} xAxis={xAxis} yAxis={yAxis} />;
        }

        return null;
    }, [hovered, tooltip, xAxis, yAxis]);

    if (!position || !hovered) {
        return null;
    }

    const {left, top} = position;
    const style: React.CSSProperties = {
        position: 'absolute',
        top,
        left: left,
    };

    return (
        <div ref={ref} className={b()} style={style}>
            {content}
        </div>
    );
};
