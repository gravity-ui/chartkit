import React from 'react';
import {StoryObj} from '@storybook/react';
import {withKnobs} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {D3Plugin} from '../..';
import {Basic} from '../../examples/area/Basic';

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

export default {
    title: 'Plugins/D3/Area',
    decorators: [withKnobs],
    component: ChartStory,
};
