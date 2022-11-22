import React from 'react';
import {Story, Meta} from '@storybook/react';
import {Button, ThemeProvider} from '@gravity-ui/uikit';
import {ChartKit} from '../../../components/ChartKit';
import {data} from './mocks/column';
import {ChartKitRef} from '../../../types';
import {settings} from '../../../libs';
import {HighchartsPlugin} from '../index';
import holidays from './mocks/holidays';

export default {
    title: 'Plugins/Highcharts/Column',
    component: ChartKit,
    args: {
        theme: 'light',
    },
    argTypes: {
        theme: {
            options: ['light', 'dark'],
            control: {type: 'radio'},
        },
        ref: {
            table: {
                disable: true,
            },
        },
        hoistConfigError: {
            table: {
                disable: true,
            },
        },
        onError: {
            table: {
                disable: true,
            },
        },
        data: {
            table: {
                disable: true,
            },
        },
        type: {
            table: {
                disable: true,
            },
        },
        id: {
            table: {
                disable: true,
            },
        },
        isMobile: {
            table: {
                disable: true,
            },
        },
        onLoad: {
            table: {
                disable: true,
            },
        },
    },
} as Meta;

const Template: Story<any> = (args: {theme: 'light' | 'dark'}) => {
    console.log(args, 'args');

    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [HighchartsPlugin], extra: {holidays}});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <ThemeProvider theme={args.theme}>
            <ChartKit
                ref={chartkitRef}
                id="1"
                type="highcharts"
                data={data}
                hoistConfigError={false}
                onError={() => console.log('onError invoked')}
            />
        </ThemeProvider>
    );
};

export const Column = Template.bind({});
