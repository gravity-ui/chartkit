import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {Meta, Story} from '@storybook/react';
import {randomNormal} from 'd3';

import {HighchartsPlugin, HighchartsWidgetData} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import type {ChartKitRef} from '../../../../types';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const widgetData = React.useMemo(() => {
        const categories = Array.from({length: 5000}).map((_, i) => String(i));
        const randomFn = randomNormal(0, 10);

        return {
            data: {
                graphs: [
                    {
                        type: 'scatter',
                        name: 'Series 1',
                        data: categories.map((_, i) => ({
                            x: i,
                            y: randomFn(),
                        })),
                    },
                ],
                categories: categories,
            },
            libraryConfig: {
                chart: {
                    type: 'scatter',
                },
            },
        } as unknown as HighchartsWidgetData;
    }, []);

    if (!shown) {
        settings.set({plugins: [HighchartsPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ChartKit
                ref={chartkitRef}
                type="highcharts"
                data={widgetData}
                onLoad={action('onLoad')}
                onRender={action('onRender')}
            />
        </div>
    );
};

export const PerformanceIssue = Template.bind({});

const meta: Meta = {
    title: 'Plugins/Highcharts/Scatter',
};

export default meta;
