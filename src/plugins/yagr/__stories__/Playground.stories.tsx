import React from 'react';
import {StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {YagrPlugin, YagrWidgetData} from '../index';
import {ChartKitRef} from '../../../types';
import {settings} from '../../../libs';
import {ChartKit} from '../../../components/ChartKit';

function prepareData(): YagrWidgetData {
    return {
        data: {
            timeline: [1705525200, 1705611600],
            timeZone: 'UTC',
            graphs: [
                {
                    id: 'a',
                    name: 'a',
                    color: 'rgb(255,255,0)',
                    data: [43.97782069570251, 42.474166396151084],
                },
                {
                    id: 'b',
                    name: 'b',
                    color: 'rgb(255,0,0)',
                    data: [42.814983190371834, 41.47785724489535],
                },
            ],
        },
        libraryConfig: {
            axes: {
                x: {label: 'UTC', labelSize: 25},
                y: {label: '', precision: 'auto', scale: 'y', side: 'left'},
            },
            chart: {
                appearance: {drawOrder: ['plotLines', 'series', 'axes']},
                series: {type: 'area', interpolation: 'linear'},
                select: {zoom: false},
                timeMultiplier: 0.001,
            },
            cursor: {snapToValues: false, x: {style: '1px solid #ffa0a0'}, y: {visible: false}},
            legend: {show: true},
            scales: {
                x: {},
                y: {normalize: false, stacking: true, type: 'linear'},
                yRight: {normalize: false, stacking: true, type: 'linear'},
            },
            tooltip: {
                show: true,
                hideNoData: false,
                maxLines: 15,
                percent: false,
                precision: 2,
                sum: false,
                tracking: 'area',
            },
        },
    };
}

const ChartStory = ({data}: {data: YagrWidgetData}) => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();

    if (!shown) {
        settings.set({plugins: [YagrPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: 300, width: '100%'}}>
            <ChartKit ref={chartkitRef} id="1" type="yagr" data={data} />
        </div>
    );
};

export const PlaygroundLineChartStory: StoryObj<typeof ChartStory> = {
    name: 'Playground',
    args: {
        data: prepareData(),
    },
    argTypes: {
        data: {
            control: 'object',
        },
    },
};

export default {
    title: 'Plugins/Yagr',
    component: ChartStory,
};
