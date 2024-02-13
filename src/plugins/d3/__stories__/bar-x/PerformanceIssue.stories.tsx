import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';
import {randomNormal} from 'd3';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import type {ChartKitRef, ChartKitWidgetData} from '../../../../types';
import {randomString} from '../../../../utils';

const randomFn = randomNormal(0, 10);
const randomStr = () => randomString(Math.random() * 10, 'absdEFGHIJklmnopqrsTUvWxyz');

const ChartStory = (args: {pointsCount: number; seriesCount: number}) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const widgetData: ChartKitWidgetData = React.useMemo(() => {
        const points = Array.from({length: args.pointsCount}).map(() =>
            Math.ceil(Math.abs(randomFn())),
        );
        const series = Array.from({length: args.seriesCount}).map(randomStr);

        return {
            series: {
                data: series.map((s) => ({
                    type: 'bar-x',
                    stacking: 'normal',
                    name: s,
                    data: points.map((p, i) => ({
                        x: i,
                        y: p,
                    })),
                })),
            },
        };
    }, [args]);

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ChartKit
                ref={chartkitRef}
                type="d3"
                data={widgetData}
                onRender={action('onRender')}
                onLoad={action('onLoad')}
                onChartLoad={action('onChartLoad')}
            />
        </div>
    );
};

export const PerformanceIssueScatter: StoryObj<typeof ChartStory> = {
    name: 'Performance issue',
    args: {
        pointsCount: 1000,
        seriesCount: 10,
    },
    argTypes: {
        pointsCount: {
            control: 'number',
        },
    },
};

export default {
    title: 'Plugins/D3/Bar-X',
    component: ChartStory,
};
