import {Button} from '@gravity-ui/uikit';
import {boolean, color as colorKnob, radios, text, withKnobs} from '@storybook/addon-knobs';
import {Meta, Story} from '@storybook/react';
import {cloneDeep} from 'lodash';
import React from 'react';

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

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const color = colorKnob('color', '#4da2f1');
    const size = radios<IndicatorWidgetDataItem['size']>(
        'size',
        {s: 's', m: 'm', l: 'l', xl: 'xl'},
        'm',
    );
    const title = text('title', 'Value title');
    const nowrap = boolean('nowrap', false);
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
            <ChartKit ref={chartkitRef} id="1" type="indicator" data={resultData} />
        </div>
    );
};

export const Showcase = Template.bind({});

const meta: Meta = {
    title: 'Plugins/Indicator',
    decorators: [withKnobs],
};

export default meta;
