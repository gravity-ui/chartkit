import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../libs';
import {HighchartsPlugin} from '../..';
import {ChartKit} from '../../../components/ChartKit';
import type {ChartKitRef} from '../../../types';
import {data} from './mocks/pie';

export default {
    title: 'Plugins/Highcharts/Pie',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [HighchartsPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit ref={chartkitRef} type="highcharts" data={data} />
        </div>
    );
};
export const Pie = Template.bind({});
