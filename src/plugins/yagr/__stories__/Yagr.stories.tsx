import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../libs';
import {YagrPlugin} from '../../../plugins';
import {ChartKit} from '../../../components/ChartKit';
import type {ChartKitRef} from '../../../types';
import {getNewConfig, line10} from './mocks/line10';

import '@gravity-ui/yagr/dist/index.css';

export default {
    title: 'Plugins/Yagr',
    component: ChartKit,
} as Meta;

const LineTemplate: Story<any> = () => {
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

const UpdatesTemplate: Story<any> = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const [state, setState] = React.useState(line10);

    const onStartUpdates = React.useCallback(() => {
        setInterval(() => {
            setState(getNewConfig());
        }, 1000);
    }, []);

    if (!shown) {
        settings.set({plugins: [YagrPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit ref={chartkitRef} id="1" type="yagr" data={state} />
            <Button onClick={onStartUpdates}>Start Updates</Button>
            <Button onClick={() => setState(getNewConfig())}>Once</Button>
        </div>
    );
};
export const Line = LineTemplate.bind({});
export const Updates = UpdatesTemplate.bind({});
