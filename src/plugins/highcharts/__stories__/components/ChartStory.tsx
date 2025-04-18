import React from 'react';

import {Button} from '@gravity-ui/uikit';

import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitRef, RenderError} from '../../../../types';
import {HighchartsPlugin} from '../../index';
import holidays from '../../mocks/holidays';
import {HighchartsWidgetData} from '../../types';

const DEFAULT_STORY_HEIGHT = '300px';
const DEFAULT_STORY_WIDTH = '100%';

export type ChartStoryProps = {
    data: HighchartsWidgetData;

    withoutPlugin?: boolean;
    visible?: boolean;
    splitTooltip?: boolean;
    height?: string;
    width?: string;
    renderError?: RenderError;
};
export const ChartStory: React.FC<ChartStoryProps> = (props: ChartStoryProps) => {
    const {height, width, data} = props;

    const initRef = React.useRef(false);
    const [visible, setVisible] = React.useState(Boolean(props.visible));
    const chartKitRef = React.useRef<ChartKitRef>();

    if (!initRef.current) {
        if (!props.withoutPlugin) {
            settings.set({plugins: [HighchartsPlugin], extra: {holidays}});
        }
        initRef.current = true;
    }

    if (!visible) {
        return <Button onClick={() => setVisible(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: height || DEFAULT_STORY_HEIGHT,
                width: width || DEFAULT_STORY_WIDTH,
            }}
        >
            <ChartKit
                ref={chartKitRef}
                type="highcharts"
                data={data}
                renderError={props.renderError}
                splitTooltip={props.splitTooltip}
            />
        </div>
    );
};
