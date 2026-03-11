import React from 'react';

import {Button} from '@gravity-ui/uikit';
import type {Meta, StoryObj} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {filledData, noData} from '../../mocks/no-data';
import {ChartStory} from '../components/ChartStory';

const meta: Meta = {
    title: 'Plugins/Highcharts/NoData',
    component: ChartKit,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const NoData: Story = {
    render: () => {
        const [data, setData] = React.useState(noData);

        const handleUpdateData = React.useCallback(() => {
            setData(filledData);
        }, []);

        return (
            <div>
                <div style={{marginBottom: 12}}>
                    <Button onClick={handleUpdateData}>Add data</Button>
                </div>
                <ChartStory data={data} visible={true} />
            </div>
        );
    },
};
