import React from 'react';

import type {TooltipHoveredData} from '../../../../../types/widget-data';

import {PreparedTooltip} from '../useChartOptions/types';
import type {PointerPosition, OnSeriesMouseMove, OnSeriesMouseLeave} from './types';

type Args = {
    tooltip: PreparedTooltip;
};

export const useTooltip = ({tooltip}: Args) => {
    const [hovered, setTooltipHoveredData] = React.useState<TooltipHoveredData | undefined>();
    const [pointerPosition, setPointerPosition] = React.useState<PointerPosition | undefined>();

    const handleSeriesMouseMove = React.useCallback<OnSeriesMouseMove>(
        ({pointerPosition: nextPointerPosition, hovered: nextHovered}) => {
            setTooltipHoveredData(nextHovered);
            setPointerPosition(nextPointerPosition);
        },
        [],
    );

    const handleSeriesMouseLeave = React.useCallback<OnSeriesMouseLeave>(() => {
        setTooltipHoveredData(undefined);
        setPointerPosition(undefined);
    }, []);

    return {
        hovered,
        pointerPosition,
        handleSeriesMouseMove: tooltip.enabled ? handleSeriesMouseMove : undefined,
        handleSeriesMouseLeave: tooltip.enabled ? handleSeriesMouseLeave : undefined,
    };
};
