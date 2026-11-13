import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {Meta, StoryObj} from '@storybook/react';
import {action} from 'storybook/actions';

import {IndicatorPlugin} from '../';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {ChartKitProps, ChartKitRef} from '../../../types';
import type {IndicatorWidgetDataItem} from '../public-types';

interface ChartStoryProps {
    color: string;
    size: IndicatorWidgetDataItem['size'];
    title: string;
    nowrap: boolean;
}

const ChartStory = ({color, size, title, nowrap}: ChartStoryProps) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef | undefined>(undefined);
    const resultData: ChartKitProps<'indicator'>['data'] = {
        data: [{value: {value: 1539577973, color}, size, title, nowrap}],
    };

    if (!shown) {
        settings.set({plugins: [IndicatorPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit
                ref={chartkitRef}
                id="1"
                type="indicator"
                data={resultData}
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
    },
    argTypes: {
        color: {control: 'color'},
        size: {control: 'radio', options: ['s', 'm', 'l', 'xl']},
        title: {control: 'text'},
        nowrap: {control: 'boolean'},
    },
};

interface SecondaryValueStoryProps extends ChartStoryProps {
    secondaryValuePosition: NonNullable<IndicatorWidgetDataItem['secondaryValue']>['position'];
    secondaryValue: Omit<NonNullable<IndicatorWidgetDataItem['secondaryValue']>, 'position'>;
}

export const WithSecondaryValue: StoryObj<SecondaryValueStoryProps> = {
    render: ({color, size, title, nowrap, secondaryValuePosition, secondaryValue}) => {
        settings.set({plugins: [IndicatorPlugin]});

        return (
            <div style={{height: 300, width: '100%'}}>
                <ChartKit
                    type="indicator"
                    data={{
                        data: [
                            {
                                value: {value: 1539577973, color},
                                size,
                                title,
                                nowrap,
                                secondaryValue: {
                                    ...secondaryValue,
                                    position: secondaryValuePosition,
                                },
                            },
                        ],
                    }}
                    onLoad={action('onLoad')}
                />
            </div>
        );
    },
    args: {
        ...Showcase.args,
        secondaryValuePosition: 'bottom',
        secondaryValue: {
            value: 0.124,
            numberFormat: {format: 'percent', precision: 1, signDisplay: 'exceptZero'},
            caption: 'vs the previous month',
            arrow: {direction: 'up', ariaLabel: 'Increase'},
            color: 'var(--g-color-text-positive)',
            view: 'label',
        },
    },
    argTypes: {
        ...Showcase.argTypes,
        secondaryValuePosition: {
            control: 'radio',
            options: ['bottom', 'right'],
        },
        secondaryValue: {
            control: 'object',
        },
    },
};
