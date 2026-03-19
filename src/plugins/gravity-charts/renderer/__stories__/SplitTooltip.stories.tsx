import React from 'react';

import type {StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';

import {StoryWrapper} from './StoryWrapper';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function generateBarXData() {
    const categories = MONTHS;
    const revenue = categories.map((_, i) => ({
        x: i,
        y: 40 + Math.sin(i * 0.5) * 25 + (i % 5) * 2,
    }));
    const expenses = categories.map((_, i) => ({
        x: i,
        y: 25 + Math.cos(i * 0.3) * 15 + (i % 3) * 3,
    }));
    const profit = categories.map((_, i) => ({
        x: i,
        y: (revenue[i].y as number) - (expenses[i].y as number),
    }));

    return {
        categories,
        series: [
            {name: 'Revenue', color: '#4DA2F1', data: revenue},
            {name: 'Expenses', color: '#FF3D64', data: expenses},
            {name: 'Profit', color: '#8AD554', data: profit},
        ],
    };
}

const barXData = generateBarXData();

export const SplitTooltipBarX: StoryObj = {
    name: 'Bar-X with crosshair',
    render: () => {
        return (
            <StoryWrapper style={{height: 400}}>
                <ChartKit
                    type="gravity-charts"
                    data={{
                        series: {
                            data: barXData.series.map((s) => ({
                                type: 'bar-x' as const,
                                name: s.name,
                                color: s.color,
                                stacking: 'normal',
                                data: s.data,
                            })),
                        },
                        legend: {enabled: false},
                        xAxis: {
                            type: 'category',
                            categories: barXData.categories,
                            crosshair: {enabled: true},
                        },
                        tooltip: {
                            valueFormat: {
                                precision: 2,
                                type: 'number',
                            },
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
