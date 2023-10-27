import React from 'react';
import isNil from 'lodash/isNil';
import type {Dispatch} from 'd3';

import type {TooltipDataChunk} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import type {PointerPosition, PreparedAxis, PreparedTooltip} from '../../hooks';
import {DefaultContent} from './DefaultContent';

export * from './TooltipTriggerArea';

const b = block('d3-tooltip');
const POINTER_OFFSET_X = 20;

type TooltipProps = {
    dispatcher: Dispatch<object>;
    tooltip: PreparedTooltip;
    svgContainer: SVGSVGElement | null;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
    hovered?: TooltipDataChunk[];
    pointerPosition?: PointerPosition;
};

export const Tooltip = (props: TooltipProps) => {
    const {tooltip, svgContainer, xAxis, yAxis, hovered, pointerPosition} = props;
    const ref = React.useRef<HTMLDivElement>(null);
    const size = React.useMemo(() => {
        if (ref.current && hovered) {
            const {width, height} = ref.current.getBoundingClientRect();
            return {width, height};
        }
        return undefined;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hovered, pointerPosition]);
    const position = React.useMemo(() => {
        if (hovered && pointerPosition && size) {
            const {clientWidth} = document.documentElement;
            const {width, height} = size;
            const rect = svgContainer?.getBoundingClientRect() || {left: 0, top: 0};
            const [pointerLeft, pointetTop] = pointerPosition;
            const outOfRightBoudary =
                pointerLeft + width + rect.left + POINTER_OFFSET_X >= clientWidth;
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
    }, [hovered, pointerPosition, size, svgContainer]);
    const content = React.useMemo(() => {
        if (!hovered) {
            return null;
        }

        const customTooltip = tooltip.renderer?.({hovered});

        return isNil(customTooltip) ? (
            <DefaultContent hovered={hovered} xAxis={xAxis} yAxis={yAxis} />
        ) : (
            customTooltip
        );
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
