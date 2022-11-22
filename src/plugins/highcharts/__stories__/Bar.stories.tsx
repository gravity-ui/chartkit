import React from 'react';
import {Story, Meta} from '@storybook/react';
import {Button, ThemeProvider} from '@gravity-ui/uikit';
import {ChartKit} from '../../../components/ChartKit';
import {ChartKitRef} from '../../../types';
import {settings} from '../../../libs';
import {HighchartsPlugin} from '../index';
import {defaultChartKitPropsControlsState} from './constants/story-settings';
import holidays from './mocks/holidays';
import {data} from './mocks/bar';

export default {
    title: 'Plugins/Highcharts/Column',
    component: ChartKit,
    args: {
        theme: 'light',
    },
    argTypes: {
        theme: {
            options: ['light', 'light-hc', 'dark', 'dark-hc'],
            control: {type: 'radio'},
        },
        ...defaultChartKitPropsControlsState,
    },
} as Meta;

const Template: Story<any> = (args: {theme: 'light' | 'light-hc' | 'dark' | 'dark-hc'}) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [HighchartsPlugin], extra: {holidays}});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <ThemeProvider theme={args.theme}>
            <div style={{height: '600px', width: '100%'}}>
                <ChartKit
                    ref={chartkitRef}
                    id="1"
                    type="highcharts"
                    data={data}
                    hoistConfigError={false}
                    onError={() => console.log('onError invoked')}
                />
            </div>
        </ThemeProvider>
    );
};

export const Bar = Template.bind({});
