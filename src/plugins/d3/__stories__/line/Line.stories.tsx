import React from 'react';

import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import {AxisTitle} from '../../examples/line/AxisTitle';
import {LineWithLogarithmicAxis} from '../../examples/line/LogarithmicAxis';

const ChartStory = ({Chart}: {Chart: React.FC}) => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
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

export const LogarithmicAxis: StoryObj<typeof ChartStory> = {
    name: 'Logarithmic axis',
    args: {
        Chart: LineWithLogarithmicAxis,
    },
};

export const AxisTitleStory: StoryObj<typeof ChartStory> = {
    name: 'Axis title',
    args: {
        Chart: AxisTitle,
    },
};

export default {
    title: 'Plugins/D3/Line',
    component: ChartStory,
};
