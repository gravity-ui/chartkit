import React from 'react';

import {ChartTooltipContent} from '@gravity-ui/charts';
import type {ChartTooltipContentProps} from '@gravity-ui/charts';

export type TooltipContentRef = {
    redraw: (updates?: Omit<ChartTooltipContentProps, 'renderer'>) => void;
};

type TooltipContentProps = Pick<ChartTooltipContentProps, 'renderer'>;

export const TooltipContent = React.forwardRef<TooltipContentRef, TooltipContentProps>(
    function TooltipContent(props, forwardedRef) {
        const {renderer} = props;
        const [tooltipProps, setTooltipProps] = React.useState<
            Omit<ChartTooltipContentProps, 'renderer'> | undefined
        >();

        React.useImperativeHandle(
            forwardedRef,
            () => ({
                redraw(updates?: ChartTooltipContentProps) {
                    setTooltipProps(updates);
                },
            }),
            [],
        );

        return <ChartTooltipContent {...tooltipProps} renderer={renderer} />;
    },
);
