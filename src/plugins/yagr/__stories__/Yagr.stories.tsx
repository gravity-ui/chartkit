import React, {useEffect, useState} from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Button} from '@gravity-ui/uikit';
import placement from '@gravity-ui/yagr/dist/YagrCore/plugins/tooltip/placement';
import {Meta, Story} from '@storybook/react';

import {CustomTooltipProps, TooltipHandlerData, YagrPlugin} from '../';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {ChartKitRef} from '../../../types';

import {getNewConfig, line10, line10WithGrafanaStyle} from './mocks/line10';

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

function Tooltip({yagr}: CustomTooltipProps) {
    const [x, setX] = useState<number | null | undefined>(null);
    const [visible, setVisible] = useState(false);
    const tooltipRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!yagr) {
            return;
        }

        const onChange = (_: unknown, data: TooltipHandlerData) => {
            setX(data.data?.x);
            setVisible(data.state.visible);

            if (data.state.visible && tooltipRef.current && data.data?.anchor) {
                placement(tooltipRef.current, data.data.anchor, 'right', {
                    xOffset: 24,
                    yOffset: 24,
                });
            }
        };

        yagr.plugins.tooltip?.on('render', onChange);
        yagr.plugins.tooltip?.on('show', onChange);
        yagr.plugins.tooltip?.on('hide', onChange);
    }, [yagr]);

    if (!visible) {
        return null;
    }

    return (
        <div
            style={{
                zIndex: 1000,
                backgroundColor: 'white',
                padding: 8,
                pointerEvents: 'none',
            }}
            ref={tooltipRef}
        >
            {dateTime({input: x ?? 0}).format('DD MMMM YYYY HH:mm:ss')}
        </div>
    );
}

const CustomTooltipImpl: Story<any> = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const [state, setState] = React.useState(line10);

    if (!shown) {
        settings.set({plugins: [YagrPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit
                ref={chartkitRef}
                id="1"
                type="yagr"
                data={state}
                tooltip={(props: CustomTooltipProps) => <Tooltip {...props} />}
            />
            <Button onClick={() => setState(getNewConfig())}>Change data</Button>
        </div>
    );
};

const AreaTemplate: Story<any> = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [YagrPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit ref={chartkitRef} id="1" type="yagr" data={line10WithGrafanaStyle} />
        </div>
    );
};

export const Line = LineTemplate.bind({});
export const Updates = UpdatesTemplate.bind({});
export const CustomTooltip = CustomTooltipImpl.bind({});
export const Area = AreaTemplate.bind({});
