import React, {useEffect, useState} from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Button, Flex} from '@gravity-ui/uikit';
import {placement} from '@gravity-ui/yagr';
import type {Meta, StoryObj} from '@storybook/react';

import {CustomTooltipProps, TooltipHandlerData, YagrPlugin} from '../';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {ChartKitRef} from '../../../types';
import type {YagrWidgetData} from '../types';

import {LABELED_DATA} from './mocks/labels';
import {getNewConfig, line10, line10WithGrafanaStyle} from './mocks/line10';

import '@gravity-ui/yagr/index.css';

const meta: Meta = {
    title: 'Plugins/Yagr',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

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

export const Line: Story = {
    render: () => {
        const [shown, setShown] = React.useState(false);
        const chartkitRef = React.useRef<ChartKitRef | undefined>(undefined);

        if (!shown) {
            settings.set({plugins: [YagrPlugin]});
            return <Button onClick={() => setShown(true)}>Show chart</Button>;
        }

        return (
            <div style={{height: 300, width: '100%'}}>
                <ChartKit ref={chartkitRef} id="1" type="yagr" data={line10} />
            </div>
        );
    },
};

export const Updates: Story = {
    render: () => {
        const [shown, setShown] = React.useState(false);
        const chartkitRef = React.useRef<ChartKitRef | undefined>(undefined);

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
    },
};

export const CustomTooltip: Story = {
    render: () => {
        const [shown, setShown] = React.useState(false);
        const chartkitRef = React.useRef<ChartKitRef | undefined>(undefined);

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
    },
};

export const Area: Story = {
    render: () => {
        const [shown, setShown] = React.useState(false);
        const chartkitRef = React.useRef<ChartKitRef | undefined>(undefined);

        if (!shown) {
            settings.set({plugins: [YagrPlugin]});
            return <Button onClick={() => setShown(true)}>Show chart</Button>;
        }

        return (
            <div style={{height: 300, width: '100%'}}>
                <ChartKit ref={chartkitRef} id="1" type="yagr" data={line10WithGrafanaStyle} />
            </div>
        );
    },
};

export const DataLabels: Story = {
    render: () => {
        const [enabled, setEnabled] = React.useState(true);
        const [padding, setPadding] = React.useState(5);
        settings.set({plugins: [YagrPlugin]});

        const data: YagrWidgetData = {
            ...LABELED_DATA,
            data: {
                ...LABELED_DATA.data,
                graphs: LABELED_DATA.data.graphs.map((graph) => ({
                    ...graph,
                    dataLabels: {enabled, padding},
                })),
            },
        };

        return (
            <div>
                <div style={{height: 300}}>
                    <ChartKit id="data-labels" type="yagr" data={data} />
                </div>
                <Flex gap="spacing-2">
                    <Button onClick={() => setEnabled(!enabled)}>
                        {enabled ? 'Hide labels' : 'Show labels'}
                    </Button>
                    <Button onClick={() => setPadding(padding === 0 ? 8 : 0)}>
                        Padding: {padding}px
                    </Button>
                </Flex>
            </div>
        );
    },
};
