import React, {useEffect, useState} from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import {Button} from '@gravity-ui/uikit';
import {placement} from '@gravity-ui/yagr';
import type {Meta, StoryObj} from '@storybook/react';

import {CustomTooltipProps, TooltipHandlerData, YagrPlugin} from '../';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {ChartKitRef} from '../../../types';
import type {YagrWidgetData} from '../types';

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

const POINT_LABELS_DATA: YagrWidgetData = {
    data: {
        timeline: [Date.UTC(2026, 0, 1), Date.UTC(2026, 0, 2)],
        graphs: [{id: 'revenue', name: 'Revenue', data: [10, 20], pointLabels: ['Plan', 'Actual']}],
    },
    libraryConfig: {
        chart: {series: {type: 'line'}},
        scales: {y: {min: 0, max: 40}},
    },
};

export const PreparedLabels: Story = {
    name: 'Prepared labels',
    render: () => {
        const [labels, setLabels] = React.useState(['Plan', 'Actual']);
        const [showLabels, setShowLabels] = React.useState(true);
        settings.set({plugins: [YagrPlugin]});

        const data: YagrWidgetData = {
            ...POINT_LABELS_DATA,
            data: {
                ...POINT_LABELS_DATA.data,
                graphs: POINT_LABELS_DATA.data.graphs.map((graph) => ({
                    ...graph,
                    pointLabels: showLabels ? labels : undefined,
                })),
            },
        };

        return (
            <div>
                <div style={{height: 300}}>
                    <ChartKit id="prepared-labels" type="yagr" data={data} />
                </div>
                <Button onClick={() => setLabels(['Updated plan', 'Updated actual'])}>
                    Update labels
                </Button>
                <Button onClick={() => setShowLabels(!showLabels)}>
                    {showLabels ? 'Hide labels' : 'Show labels'}
                </Button>
            </div>
        );
    },
};
