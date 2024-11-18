import React from 'react';

import type {ChartTooltipContentProps} from '@gravity-ui/charts';
import type {StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';

import {StoryWrapper} from './StoryWrapper';

function getPieSegmentData(name: string, color: string, index: number) {
    return {
        name,
        value: index * 10,
        label: name,
        color: color,
    };
}

const initialContent = {
    hovered: [
        {
            data: {
                name: 'One',
                value: 10,
                label: 'One',
                color: '#4fc4b7',
            },
            series: {
                type: 'pie',
                name: 'One',
                id: 'Series 0',
                // @ts-expect-error
                color: '#4fc4b7',
            },
        },
    ],
} satisfies ChartTooltipContentProps;

export const SplitTooltipBasicWithInitialContent: StoryObj = {
    name: 'With initial content',
    render: () => {
        return (
            <StoryWrapper>
                <ChartKit
                    type="d3"
                    data={{
                        series: {
                            data: [
                                {
                                    type: 'pie',
                                    dataLabels: {
                                        enabled: true,
                                        html: true,
                                        connectorPadding: 8,
                                    },
                                    data: [
                                        getPieSegmentData('One', '#4fc4b7', 1),
                                        getPieSegmentData('Two', '#59abc9', 2),
                                        getPieSegmentData('Three', '#8ccce3', 3),
                                    ],
                                },
                            ],
                        },
                    }}
                    splitTooltip={{enabled: true, initialContent}}
                />
            </StoryWrapper>
        );
    },
};

export default {
    title: 'Plugins/Gravity Chart/Split tooltip',
};
