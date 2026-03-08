import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {Meta, StoryObj} from '@storybook/react';
import cloneDeep from 'lodash/cloneDeep';
import {action} from 'storybook/actions';

import {IndicatorPlugin} from '../';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {ChartKitRef} from '../../../types';
import type {IndicatorWidgetData, IndicatorWidgetDataItem} from '../types';

const data: IndicatorWidgetData = {
    data: [
        {
            content: {
                current: {
                    value: 1539577973,
                },
            },
        },
    ],
};

interface ChartStoryProps {
    color: string;
    size: IndicatorWidgetDataItem['size'];
    title: string;
    nowrap: boolean;
}

const ChartStory = ({color, size, title, nowrap}: ChartStoryProps) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const resultData = cloneDeep(data);

    if (resultData.data) {
        resultData.data[0].size = size;
        resultData.data[0].color = color;
        resultData.data[0].title = title;
        resultData.data[0].nowrap = nowrap;
    }

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
