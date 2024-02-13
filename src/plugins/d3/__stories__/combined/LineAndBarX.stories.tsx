import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {withKnobs} from '@storybook/addon-knobs';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {settings} from '../../../../libs';
import {LineAndBarXCombinedChart} from '../../examples/combined/LineAndBarX';

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

export const LineAndBarXCombinedChartStory: StoryObj<typeof ChartStory> = {
    name: 'Line and Bar-x combined chart',
    args: {
        Chart: LineAndBarXCombinedChart,
    },
};

export default {
    title: 'Plugins/D3/Combined',
    decorators: [withKnobs],
    component: ChartStory,
};
