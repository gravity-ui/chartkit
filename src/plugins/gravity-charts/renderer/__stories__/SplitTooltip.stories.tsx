import React from 'react';

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

export const SplitTooltipBasic: StoryObj = {
    name: 'Basic',
    render: () => {
        return (
            <StoryWrapper>
                <ChartKit
                    type="gravity-charts"
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
                    tooltip={{splitted: true}}
                />
            </StoryWrapper>
        );
    },
};

export default {
    title: 'Plugins/Gravity Chart/Split tooltip',
};
