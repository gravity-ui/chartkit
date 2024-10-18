import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import type {ChartKitRef, ChartKitWidgetData, TreemapSeries} from '../../../../types';

const prepareData = (): ChartKitWidgetData => {
    const treemapSeries: TreemapSeries = {
        type: 'treemap',
        name: 'Example',
        dataLabels: {
            enabled: true,
        },
        layoutAlgorithm: 'binary',
        levels: [
            {index: 1, padding: 5},
            {index: 2, padding: 3},
            {index: 3, padding: 1},
        ],
        data: [
            {name: 'One', value: 15},
            {name: 'Two', value: 10},
            {name: 'Three', value: 15},
            {name: 'Four'},
            {name: ['Four', '1'], value: 5, parentId: 'Four'},
            {name: 'Four-2', parentId: 'Four'},
            {name: 'Four-3', value: 4, parentId: 'Four'},
            {name: 'Four-2-1', value: 5, parentId: 'Four-2'},
            {name: 'Four-2-2', value: 7, parentId: 'Four-2'},
            {name: 'Four-2-3', value: 10, parentId: 'Four-2'},
        ],
    };

    return {
        series: {
            data: [treemapSeries],
        },
        chart: {
            events: {
                click: action('chart.events.click'),
            },
        },
    };
};

const ChartStory = ({data}: {data: ChartKitWidgetData}) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ChartKit ref={chartkitRef} type="d3" data={data} />
        </div>
    );
};

export const TreemapPlayground: StoryObj<typeof ChartStory> = {
    name: 'Playground',
    args: {data: prepareData()},
    argTypes: {
        data: {
            control: 'object',
        },
    },
};

export default {
    title: 'Plugins/D3/Treemap',
    component: ChartStory,
};
