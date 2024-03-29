import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {withKnobs} from '@storybook/addon-knobs';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {settings} from '../../../../libs';
import {BasicPie} from '../../examples/pie/Basic';
import {Donut} from '../../examples/pie/Donut';
import {DonutWithTotals} from '../../examples/pie/DonutWithTotals';

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

export const BasicPieStory: StoryObj<typeof ChartStory> = {
    name: 'Basic pie',
    args: {
        Chart: BasicPie,
    },
};

export const BasicDonutStory: StoryObj<typeof ChartStory> = {
    name: 'Basic donut',
    args: {
        Chart: Donut,
    },
};

export const DonutWithTotalsStory: StoryObj<typeof ChartStory> = {
    name: 'Donut with totals',
    args: {
        Chart: DonutWithTotals,
    },
};

export default {
    title: 'Plugins/D3/Pie',
    decorators: [withKnobs],
    component: ChartStory,
};
