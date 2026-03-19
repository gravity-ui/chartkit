import React from 'react';

import type {ChartData} from '@gravity-ui/charts';

import {ChartKit} from '../../../components/ChartKit.js';

export const CHART_TEST_STORY_DATA_QA = 'chart-test-story-data-qa';

type Props = {
    data: ChartData;
    styles?: React.CSSProperties;
    tooltip?: {splitted?: boolean};
};

export const ChartTestStory = ({data, styles, tooltip}: Props) => {
    const containerStyle: React.CSSProperties = {
        height: '100vh',
        width: '100vw',
        ...styles,
    };

    return (
        <div style={containerStyle} data-qa={CHART_TEST_STORY_DATA_QA}>
            <ChartKit type="gravity-charts" data={data} tooltip={tooltip} />
        </div>
    );
};
