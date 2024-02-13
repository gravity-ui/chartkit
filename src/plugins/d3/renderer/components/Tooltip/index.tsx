import React from 'react';

import {Popup, useVirtualElementRef} from '@gravity-ui/uikit';
import type {Dispatch} from 'd3';
import isNil from 'lodash/isNil';

import type {TooltipDataChunk} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';
import type {PointerPosition, PreparedAxis, PreparedTooltip} from '../../hooks';

import {DefaultContent} from './DefaultContent';

export * from './TooltipTriggerArea';

const b = block('d3-tooltip');

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
    const {tooltip, xAxis, yAxis, hovered, svgContainer, pointerPosition} = props;
    const containerRect = svgContainer?.getBoundingClientRect() || {left: 0, top: 0};
    const left = (pointerPosition?.[0] || 0) + containerRect.left;
    const top = (pointerPosition?.[1] || 0) + containerRect.top;
    const anchorRef = useVirtualElementRef({rect: {top, left}});
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

    React.useEffect(() => {
        window.dispatchEvent(new CustomEvent('scroll'));
    }, [left, top]);

    return hovered ? (
        <Popup
            className={b()}
            open={true}
            anchorRef={anchorRef}
            offset={[0, 20]}
            placement={['right', 'left', 'top', 'bottom']}
            modifiers={[{name: 'preventOverflow', options: {padding: 10, altAxis: true}}]}
        >
            <div className={b('content')}>{content}</div>
        </Popup>
    ) : null;
};
