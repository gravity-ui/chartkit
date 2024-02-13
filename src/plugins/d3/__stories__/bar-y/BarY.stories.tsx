import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {settings} from '../../../../libs';
import {Basic} from '../../examples/bar-y/Basic';
import {GroupedColumns} from '../../examples/bar-y/GroupedColumns';
import {PercentStackingBars} from '../../examples/bar-y/PercentStacking';
import {StackedColumns} from '../../examples/bar-y/StackedColumns';

const ChartStory = ({Chart}: {Chart: React.FC}) => {
    const [shown, setShown] = React.useState(false);

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: '80vh',
                width: '100%',
            }}
        >
            <Chart />
        </div>
    );
};

export const BasicBarYChartStory: StoryObj<typeof ChartStory> = {
    name: 'Basic',
    args: {
        Chart: Basic,
    },
};

export const GroupedBarYChartStory: StoryObj<typeof ChartStory> = {
    name: 'Grouped bars',
    args: {
        Chart: GroupedColumns,
    },
};

export const StackedBarYChartStory: StoryObj<typeof ChartStory> = {
    name: 'Stacked bars',
    args: {
        Chart: StackedColumns,
    },
};

export const PercentStackingBarYChartStory: StoryObj<typeof ChartStory> = {
    name: 'Stacked percentage bars',
    args: {
        Chart: PercentStackingBars,
    },
};

export default {
    title: 'Plugins/D3/Bar-Y',
    component: ChartStory,
};
