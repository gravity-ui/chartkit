import React from 'react';
import {Story, Meta} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {ChartKit} from '../../../../components/ChartKit';
import {ChartKitRef} from '../../../../types';
import {settings} from '../../../../libs';
import {HighchartsPlugin} from '../../index';
import holidays from '../mocks/holidays';
import {data} from '../mocks/column-ver';

export default {
    title: 'Plugins/Highcharts/Column',
    component: ChartKit,
} as Meta;

const Template: Story<any> = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [HighchartsPlugin], extra: {holidays}});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit ref={chartkitRef} type="highcharts" data={data} />
        </div>
    );
};

export const Vertical = Template.bind({});
