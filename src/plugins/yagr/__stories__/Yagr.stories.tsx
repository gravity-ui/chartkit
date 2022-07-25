import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Button} from '@yandex-cloud/uikit';
import {settings} from '../../../libs';
import {YagrPlugin} from '../../../plugins';
import {ChartKit} from '../../../components/ChartKit';
import type {ChartKitRef} from '../../../types';
import {line10} from './mocks/line10';

export default {
    title: 'Plugins/Yagr',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [YagrPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit ref={chartkitRef} id="1" type="yagr" data={line10} />
        </div>
    );
};
export const Line = Template.bind({});
