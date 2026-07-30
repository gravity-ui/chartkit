import React from 'react';

import {render} from '../../../test-utils/utils.js';
import {SplitLayout} from '../SplitPane/index.js';

import {SplitTooltip} from './SplitTooltip.js';
import type {SplitTooltipLayout} from './SplitTooltip.js';

type TestCaseProps = {
    containerHeight: number;
    containerWidth: number;
    layout?: SplitTooltipLayout;
    resizerVisible?: boolean;
    tooltipHeight: number;
    onMainPaneSizeChange?: (size: number, layout: SplitTooltipLayout) => void;
};

function TestCase({
    containerHeight,
    containerWidth,
    layout,
    resizerVisible,
    tooltipHeight,
    onMainPaneSizeChange,
}: TestCaseProps) {
    return (
        <div style={{height: containerHeight, width: containerWidth}}>
            <SplitTooltip
                layout={layout}
                resizerVisible={resizerVisible}
                onMainPaneSizeChange={onMainPaneSizeChange}
                renderMainPane={({layout: actualLayout, size}) => (
                    <div data-qa="main-pane">{`${actualLayout}:${size}`}</div>
                )}
                renderTooltip={({layout: actualLayout, size}) => (
                    <div data-qa="tooltip-pane" style={{height: tooltipHeight}}>
                        {`${actualLayout}:${size}`}
                    </div>
                )}
            />
        </div>
    );
}

describe('SplitTooltip behavior', () => {
    test('explicit layout overrides automatic layout and reaches both render functions', async () => {
        const screen = await render(
            <TestCase
                containerHeight={400}
                containerWidth={200}
                layout={SplitLayout.VERTICAL}
                tooltipHeight={40}
            />,
        );

        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('vertical:120');
        await expect.element(screen.getByTestId('tooltip-pane')).toHaveTextContent('vertical:120');
    });

    test('selects layout automatically when explicit layout is omitted', async () => {
        const screen = await render(
            <TestCase containerHeight={200} containerWidth={400} tooltipHeight={40} />,
        );

        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('vertical:240');

        await screen.rerender(
            <TestCase containerHeight={400} containerWidth={200} tooltipHeight={40} />,
        );

        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:336');
        await expect
            .element(screen.getByTestId('tooltip-pane'))
            .toHaveTextContent('horizontal:336');
    });

    test('recalculates size and reports only distinct size-layout pairs', async () => {
        const onMainPaneSizeChange = vi.fn();
        const renderTestCase = (props?: Partial<TestCaseProps>) => (
            <TestCase
                containerHeight={400}
                containerWidth={300}
                layout={SplitLayout.HORIZONTAL}
                tooltipHeight={40}
                onMainPaneSizeChange={(size, layout) => onMainPaneSizeChange(size, layout)}
                {...props}
            />
        );
        const screen = await render(renderTestCase());

        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([336, SplitLayout.HORIZONTAL]);

        const callCountAfterInitialization = onMainPaneSizeChange.mock.calls.length;
        await screen.rerender(renderTestCase());
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        expect(onMainPaneSizeChange).toHaveBeenCalledTimes(callCountAfterInitialization);

        await screen.rerender(renderTestCase({containerHeight: 500}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([436, SplitLayout.HORIZONTAL]);

        await screen.rerender(renderTestCase({containerHeight: 500, tooltipHeight: 80}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([396, SplitLayout.HORIZONTAL]);

        await screen.rerender(
            renderTestCase({
                containerHeight: 500,
                layout: SplitLayout.VERTICAL,
                tooltipHeight: 80,
            }),
        );
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([180, SplitLayout.VERTICAL]);

        const distinctCalls = onMainPaneSizeChange.mock.calls.map(([size, layout]) => ({
            layout,
            size,
        }));
        expect(distinctCalls).toEqual(
            distinctCalls.filter(
                (call, index) =>
                    index === 0 ||
                    call.layout !== distinctCalls[index - 1].layout ||
                    call.size !== distinctCalls[index - 1].size,
            ),
        );
    });

    test('resizerVisible is false by default and does not hide tooltip content', async () => {
        const screen = await render(
            <TestCase containerHeight={400} containerWidth={200} tooltipHeight={40} />,
        );

        const resizer = screen.container.querySelector<HTMLElement>('.Resizer');
        await expect.element(resizer).toHaveStyle({display: 'none'});
        await expect.element(screen.getByTestId('tooltip-pane')).toBeVisible();

        await screen.rerender(
            <TestCase
                containerHeight={400}
                containerWidth={200}
                resizerVisible={true}
                tooltipHeight={40}
            />,
        );

        expect(resizer?.style.display).toBe('');
        await expect.element(screen.getByTestId('tooltip-pane')).toBeVisible();
    });
});
