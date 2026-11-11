import React from 'react';

import {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {IndicatorPlugin} from '../';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {IndicatorSecondaryValue, IndicatorWidgetDataItem} from '../types';

settings.set({plugins: [IndicatorPlugin]});

interface ChartStoryProps {
    color: string;
    size: IndicatorWidgetDataItem['size'];
    title: string;
    nowrap: boolean;
    showSecondaryValue: boolean;
    secondaryValuePosition: IndicatorSecondaryValue['position'];
    secondaryValue: Omit<IndicatorSecondaryValue, 'position'>;
}

const ChartStory = ({
    color,
    size,
    title,
    nowrap,
    showSecondaryValue,
    secondaryValuePosition,
    secondaryValue,
}: ChartStoryProps) => {
    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit
                id="1"
                type="indicator"
                data={{
                    data: [
                        {
                            content: {current: {value: 1539577973}},
                            color,
                            size,
                            title,
                            nowrap,
                            secondaryValue: showSecondaryValue
                                ? {...secondaryValue, position: secondaryValuePosition}
                                : undefined,
                        },
                    ],
                }}
                onLoad={action('onLoad')}
            />
        </div>
    );
};

const meta: Meta<typeof ChartStory> = {
    title: 'Plugins/Indicator',
    component: ChartStory,
};

export default meta;

export const Showcase: StoryObj<typeof ChartStory> = {
    args: {
        color: '#4da2f1',
        size: 'm',
        title: 'Value title',
        nowrap: false,
        showSecondaryValue: true,
        secondaryValuePosition: 'bottom',
        secondaryValue: {
            value: 0.124,
            numberFormat: {format: 'percent', precision: 1, signDisplay: 'exceptZero'},
            caption: 'vs the previous month',
            arrow: 'up',
            color: 'var(--g-color-text-positive)',
            view: 'badge',
        },
    },
    argTypes: {
        color: {control: 'color'},
        size: {control: 'radio', options: ['s', 'm', 'l', 'xl']},
        title: {control: 'text'},
        nowrap: {control: 'boolean'},
        showSecondaryValue: {control: 'boolean'},
        secondaryValuePosition: {
            control: 'radio',
            options: ['bottom', 'right'],
            if: {arg: 'showSecondaryValue'},
        },
        secondaryValue: {
            control: 'object',
            if: {arg: 'showSecondaryValue'},
        },
    },
};
