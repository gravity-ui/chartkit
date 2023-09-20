import React from 'react';
import {Meta, Story} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitRef, ChartKitWidgetData} from '../../../../types';
import {D3Plugin} from '../..';
import {randomNormal} from 'd3';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    const widgetData: ChartKitWidgetData = React.useMemo(() => {
        const categories = Array.from({length: 5000}).map((_, i) => String(i));
        const randomFn = randomNormal(0, 10);

        return {
            xAxis: {
                type: 'category',
                categories: categories,
            },
            series: {
                data: [
                    {
                        type: 'scatter',
                        name: 'Series 1',
                        data: categories.map((_, i) => ({
                            x: i,
                            y: randomFn(),
                        })),
                    },
                ],
            },
        };
    }, []);

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '300px', width: '100%'}}>
            <ChartKit ref={chartkitRef} type="d3" data={widgetData} onRender={action('onRender')} />
        </div>
    );
};

export const PerformanceIssue = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Scatter',
};

export default meta;
