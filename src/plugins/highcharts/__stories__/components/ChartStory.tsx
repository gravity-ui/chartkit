import React from 'react';
import {Button} from '@gravity-ui/uikit';
import {ChartKitRef} from '../../../../types';
import {settings} from '../../../../libs';
import {HighchartsPlugin} from '../../index';
import holidays from '../mocks/holidays';
import {ChartKit} from '../../../../components/ChartKit';
import {HighchartsWidgetData} from '../../types';

const DEFAULT_STORY_HEIGHT = '300px';
const DEFAULT_STORY_WIDTH = '100%';

export type ChartStoryProps = {
    height?: string;
    width?: string;

    data: HighchartsWidgetData;
};
export const ChartStory: React.FC<ChartStoryProps> = (props: ChartStoryProps) => {
    const {height, width, data} = props;

    const [visible, setVisible] = React.useState(false);
    const chartKitRef = React.useRef<ChartKitRef>();

    if (!visible) {
        settings.set({plugins: [HighchartsPlugin], extra: {holidays}});
        return <Button onClick={() => setVisible(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: height || DEFAULT_STORY_HEIGHT,
                width: width || DEFAULT_STORY_WIDTH,
            }}
        >
            <ChartKit ref={chartKitRef} type="highcharts" data={data} />
        </div>
    );
};
