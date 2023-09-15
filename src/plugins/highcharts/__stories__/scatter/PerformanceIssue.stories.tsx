import React from 'react';
import {Meta, Story} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitRef} from '../../../../types';
import {HighchartsPlugin, HighchartsWidgetData} from '../..';
import {randomNormal} from 'd3';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const widgetData = React.useMemo(() => {
        const categories = Array.from({length: 5000}).map((_, i) => String(i));
        const randomFn = randomNormal(0, 1000);

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
            <ChartKit ref={chartkitRef} type="highcharts" data={widgetData} />
        </div>
    );
};

export const PerformanceIssue = Template.bind({});

const meta: Meta = {
    title: 'Plugins/Highcharts/Scatter',
};

export default meta;
