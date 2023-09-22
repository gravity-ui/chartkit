import React from 'react';
import {StoryObj} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../libs';
import {D3Plugin} from '..';
import {
    BasicBarXChart,
    BasicLinearBarXChart,
    BasicDateTimeBarXChart,
} from '../examples/bar-x/Basic';
import {GroupedColumns} from '../examples/bar-x/GroupedColumns';
import {StackedColumns} from '../examples/bar-x/StackedColumns';

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

export const BasicBarXChartStory: StoryObj<typeof ChartStory> = {
    name: 'Basic column chart',
    args: {
        Chart: BasicBarXChart,
    },
};

export const BasicLinearBarXChartStory: StoryObj<typeof ChartStory> = {
    name: 'Linear X axis',
    args: {
        Chart: BasicLinearBarXChart,
    },
};

export const BasicDateTimeBarXChartStory: StoryObj<typeof ChartStory> = {
    name: 'Datetime X axis',
    args: {
        Chart: BasicDateTimeBarXChart,
    },
};

export const GroupedBarXChartStory: StoryObj<typeof ChartStory> = {
    name: 'Grouped columns',
    args: {
        Chart: GroupedColumns,
    },
};

export const StackedBarXChartStory: StoryObj<typeof ChartStory> = {
    name: 'Stacked columns',
    args: {
        Chart: StackedColumns,
    },
};

export default {
    title: 'Plugins/D3/Bar-X',
    decorators: [withKnobs],
    component: ChartStory,
};
