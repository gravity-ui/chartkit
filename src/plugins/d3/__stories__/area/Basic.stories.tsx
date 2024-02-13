import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {withKnobs} from '@storybook/addon-knobs';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {settings} from '../../../../libs';
import {Basic} from '../../examples/area/Basic';
import {PercentStackingArea} from '../../examples/area/PercentStacking';
import {StackedArea} from '../../examples/area/StackedArea';

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

export const BasicAreaChartStory: StoryObj<typeof ChartStory> = {
    name: 'Basic',
    args: {
        Chart: Basic,
    },
};

export const StackedAreaChartStory: StoryObj<typeof ChartStory> = {
    name: 'Stacked',
    args: {
        Chart: StackedArea,
    },
};

export const PercentStackingAreaChartStory: StoryObj<typeof ChartStory> = {
    name: 'Stacked percentage areas',
    args: {
        Chart: PercentStackingArea,
    },
};

export default {
    title: 'Plugins/D3/Area',
    decorators: [withKnobs],
    component: ChartStory,
};
