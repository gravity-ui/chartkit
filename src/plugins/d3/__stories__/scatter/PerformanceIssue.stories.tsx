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

const ChartStory = (args: {categoriesCount: number; seriesCount: number}) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const widgetData: ChartKitWidgetData = React.useMemo(() => {
        const categories = Array.from({length: args.categoriesCount}).map(randomStr);
        const series = Array.from({length: args.seriesCount}).map(randomStr);

        return {
            xAxis: {
                type: 'category',
                categories: categories,
            },
            series: {
                data: series.map((s) => ({
                    type: 'scatter',
                    name: s,
                    data: categories.map((_, i) => ({
                        x: i,
                        y: randomFn(),
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
        categoriesCount: 5000,
        seriesCount: 2,
    },
    argTypes: {
        categoriesCount: {
            control: 'number',
        },
    },
};

export default {
    title: 'Plugins/D3/Scatter',
    component: ChartStory,
};
