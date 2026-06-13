import React from 'react';

import type {ChartData} from '@gravity-ui/charts';

import {render} from '../../../../test-utils/utils.js';
import {ChartKit} from '../../../components/ChartKit.js';

export const CHART_TEST_STORY_DATA_QA = 'chart-test-story-data-qa';

type Props = {
    data: ChartData;
    styles?: React.CSSProperties;
    tooltip?: {splitted?: boolean};
    onRender?: () => void;
    onError?: () => void;
};

export const ChartTestStory = ({data, styles, tooltip, onRender, onError}: Props) => {
    const containerStyle: React.CSSProperties = {
        height: '100vh',
        width: '100vw',
        ...styles,
    };

    return (
        <div style={containerStyle} data-qa={CHART_TEST_STORY_DATA_QA}>
            <ChartKit
                type="gravity-charts"
                data={data}
                tooltip={tooltip}
                onRender={onRender}
                onError={onError}
            />
        </div>
    );
};

/**
 * Renders {@link ChartTestStory} and resolves once the chart has settled — either after
 * `@gravity-ui/charts` finishes its (asynchronous) render (`onRender`, fired by
 * `GravityChartsWidget` once the chart calls `onReady`), or after the `ErrorBoundary` catches a
 * render error such as the empty-data "No data" case (`onError`). Awaiting this guarantees the DOM
 * is in its final state before assertions / `toMatchScreenshot` run, for both populated and empty
 * data.
 */
export async function renderChartStory(
    props: Omit<Props, 'onRender' | 'onError'>,
    options?: Parameters<typeof render>[1],
) {
    let resolveSettled: () => void = () => {};
    const settled = new Promise<void>((resolve) => {
        resolveSettled = resolve;
    });

    const screen = await render(
        <ChartTestStory
            {...props}
            onRender={() => resolveSettled()}
            onError={() => resolveSettled()}
        />,
        options,
    );

    await settled;

    return screen;
}
