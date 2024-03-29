import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {Meta, Story} from '@storybook/react';

import {ChartKit} from '../../../../components/ChartKit';
import {filledData, noData} from '../../mocks/no-data';
import {ChartStory} from '../components/ChartStory';

export default {
    title: 'Plugins/Highcharts/NoData',
    component: ChartKit,
} as Meta;

const Template: Story = () => {
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
};

export const NoData = Template.bind({});
