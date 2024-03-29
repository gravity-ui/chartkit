import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {withKnobs} from '@storybook/addon-knobs';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {settings} from '../../../../libs';
import {Basic} from '../../examples/scatter/Basic';

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

export const BasicScatterStory: StoryObj<typeof ChartStory> = {
    name: 'Basic',
    args: {
        Chart: Basic,
    },
};

export default {
    title: 'Plugins/D3/Scatter',
    decorators: [withKnobs],
    component: ChartStory,
};
