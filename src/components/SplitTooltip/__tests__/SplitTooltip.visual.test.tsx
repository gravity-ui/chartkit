import React from 'react';

import {page, userEvent} from 'vitest/browser';

import {render} from '../../../../test-utils/utils.js';
import {SplitLayout} from '../../SplitPane/index.js';
import {SplitTooltip} from '../SplitTooltip.js';
import type {SplitTooltipLayout, SplitTooltipProps} from '../SplitTooltip.js';

type TestCaseProps = {
    containerHeight: number;
    containerWidth: number;
    enabled?: boolean;
    hidden?: boolean;
    layout?: SplitTooltipLayout;
    mainPaneRatio?: number;
    minMainPaneSize?: number;
    onMainPaneSizeChange?: (size: number, layout: SplitTooltipLayout) => void;
    preserveManualSize?: boolean;
    resizerVisible?: boolean;
    tooltipHeight: number;
    tooltipPaneStyle?: SplitTooltipProps['tooltipPaneStyle'];
    renderMainPane?: SplitTooltipProps['renderMainPane'];
    renderTooltip?: SplitTooltipProps['renderTooltip'];
};

function TestCase({
    containerHeight,
    containerWidth,
    enabled,
    hidden,
    layout,
    mainPaneRatio,
    minMainPaneSize,
    onMainPaneSizeChange,
    preserveManualSize,
    resizerVisible,
    tooltipHeight,
    tooltipPaneStyle,
    renderMainPane,
    renderTooltip,
}: TestCaseProps) {
    return (
        <div
            style={{
                height: containerHeight,
                width: containerWidth,
                display: hidden ? 'none' : undefined,
            }}
        >
            <SplitTooltip
                enabled={enabled}
                layout={layout}
                mainPaneRatio={mainPaneRatio}
                minMainPaneSize={minMainPaneSize}
                onMainPaneSizeChange={onMainPaneSizeChange}
                preserveManualSize={preserveManualSize}
                renderMainPane={
                    renderMainPane ??
                    (({layout: actualLayout, size}) => (
                        <div data-qa="main-pane">{`${actualLayout}:${size}`}</div>
                    ))
                }
                renderTooltip={
                    renderTooltip ??
                    (({layout: actualLayout, size}) => (
                        <div data-qa="tooltip-pane" style={{height: tooltipHeight}}>
                            {`${actualLayout}:${size}`}
                        </div>
                    ))
                }
                resizerVisible={resizerVisible}
                tooltipPaneStyle={tooltipPaneStyle}
            />
        </div>
    );
}

function getElement(container: HTMLElement, selector: string) {
    const element = container.querySelector<HTMLElement>(selector);
    if (!element) {
        throw new Error(`Expected a rendered ${selector}`);
    }
    return element;
}

async function dragMainPane(container: HTMLElement, size: number) {
    const splitPane = getElement(container, '.SplitPane');
    const resizer = getElement(container, '.Resizer');
    await userEvent.dragAndDrop(resizer, splitPane, {
        targetPosition: {x: 10, y: size + 12},
    });
}

function AsyncTooltip({loadedHeight}: {loadedHeight: Promise<number>}) {
    const [height, setHeight] = React.useState(40);
    React.useEffect(() => {
        let active = true;
        loadedHeight.then((nextHeight) => {
            if (active) {
                setHeight(nextHeight);
            }
        });
        return () => {
            active = false;
        };
    }, [loadedHeight]);
    return <div style={{height}}>Async tooltip</div>;
}

function StatefulMainPane({onMount, onUnmount}: {onMount: () => void; onUnmount: () => void}) {
    const [count, setCount] = React.useState(0);
    React.useEffect(() => {
        onMount();
        return onUnmount;
    }, [onMount, onUnmount]);
    return (
        <button data-qa="stateful-main-pane" onClick={() => setCount(count + 1)}>
            {count}
        </button>
    );
}

// 12 blocks of 100x100 wrap into 6 rows (600px) in a 240px wide pane and into 4 rows (400px)
// in a 320px wide pane, so the tooltip height depends on the pane width deterministically.
const WRAPPING_TOOLTIP_BLOCKS = Array.from({length: 12}, (_, index) => index);

function WrappingTooltip() {
    return (
        <div data-qa="tooltip-pane" style={{display: 'flex', flexWrap: 'wrap'}}>
            {WRAPPING_TOOLTIP_BLOCKS.map((block) => (
                <div key={block} style={{height: 100, width: 100}} />
            ))}
        </div>
    );
}

// Mirrors the gravity-charts plugin: the layout follows the viewport orientation through the
// window resize event, which fires before the container ResizeObserver.
function useViewportLayout(): SplitTooltipLayout {
    const getLayout = () =>
        window.innerWidth > window.innerHeight ? SplitLayout.VERTICAL : SplitLayout.HORIZONTAL;
    const [layout, setLayout] = React.useState(getLayout);
    React.useLayoutEffect(() => {
        const handleResize = () => setLayout(getLayout());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return layout;
}

function ViewportLayoutTestCase({
    onMainPaneSizeChange,
}: {
    onMainPaneSizeChange: (size: number, layout: SplitTooltipLayout) => void;
}) {
    const layout = useViewportLayout();
    return (
        <div style={{position: 'fixed', inset: 0}}>
            <SplitTooltip
                layout={layout}
                onMainPaneSizeChange={onMainPaneSizeChange}
                renderMainPane={({layout: actualLayout, size}) => (
                    <div data-qa="main-pane">{`${actualLayout}:${size}`}</div>
                )}
                renderTooltip={() => <WrappingTooltip />}
            />
        </div>
    );
}

describe('SplitTooltip behavior', () => {
    beforeEach(async () => {
        await page.viewport(800, 800);
    });

    test('never reports a stale main pane size when the viewport orientation changes', async () => {
        await page.viewport(600, 300);
        const calls: [number, SplitTooltipLayout][] = [];
        const screen = await render(
            <ViewportLayoutTestCase
                onMainPaneSizeChange={(size, layout) => calls.push([size, layout])}
            />,
        );

        // Vertical: the main pane takes 60% of the width; the 240px tooltip pane wraps 6 rows.
        await expect.poll(() => calls.at(-1)).toEqual([360, SplitLayout.VERTICAL]);
        expect(calls).toEqual([[360, SplitLayout.VERTICAL]]);
        await expect.element(screen.getByTestId('tooltip-pane')).toHaveStyle({height: '600px'});

        // Horizontal: 500 - 24 (resizer) - 400 (4 rows of the now 320px wide tooltip). The layout
        // and the container size arrive separately, so the previous layout may be reported once
        // more for the new viewport, but the new layout must never come with stale dimensions
        // (300 - 24 - 600 < 0 or 500 - 24 - 600 < 0 would report a zero main pane).
        const horizontalFrom = calls.length;
        await page.viewport(320, 500);
        await expect.poll(() => calls.at(-1)).toEqual([76, SplitLayout.HORIZONTAL]);
        expect(
            calls.slice(horizontalFrom).filter(([, layout]) => layout === SplitLayout.HORIZONTAL),
        ).toEqual([[76, SplitLayout.HORIZONTAL]]);
        expect(calls.slice(horizontalFrom).map(([size]) => size)).not.toContain(0);

        // Back to vertical: the size must come from the already resized container, not from the
        // previous 320px one (320 * 0.6 = 192).
        const verticalFrom = calls.length;
        await page.viewport(600, 300);
        await expect.poll(() => calls.at(-1)).toEqual([360, SplitLayout.VERTICAL]);
        expect(
            calls.slice(verticalFrom).filter(([, layout]) => layout === SplitLayout.VERTICAL),
        ).toEqual([[360, SplitLayout.VERTICAL]]);
        expect(calls.slice(verticalFrom).map(([size]) => size)).not.toContain(0);
    });

    test('never reports a stale main pane size when a parent changes the container and the layout together', async () => {
        const calls: [number, SplitTooltipLayout][] = [];
        const renderTestCase = (props: Partial<TestCaseProps>) => (
            <TestCase
                tooltipHeight={0}
                renderTooltip={() => <WrappingTooltip />}
                onMainPaneSizeChange={(size, layout) => calls.push([size, layout])}
                containerHeight={300}
                containerWidth={600}
                layout={SplitLayout.VERTICAL}
                {...props}
            />
        );
        const screen = await render(renderTestCase({}));
        await expect.poll(() => calls.at(-1)).toEqual([360, SplitLayout.VERTICAL]);

        // The container ResizeObserver has not reported 320x500 yet: 300 - 24 - 400 < 0.
        const horizontalFrom = calls.length;
        await screen.rerender(
            renderTestCase({
                containerHeight: 500,
                containerWidth: 320,
                layout: SplitLayout.HORIZONTAL,
            }),
        );
        await expect.poll(() => calls.at(-1)).toEqual([76, SplitLayout.HORIZONTAL]);
        expect(
            calls.slice(horizontalFrom).filter(([, layout]) => layout === SplitLayout.HORIZONTAL),
        ).toEqual([[76, SplitLayout.HORIZONTAL]]);
        expect(calls.slice(horizontalFrom).map(([size]) => size)).not.toContain(0);

        const verticalFrom = calls.length;
        await screen.rerender(renderTestCase({}));
        await expect.poll(() => calls.at(-1)).toEqual([360, SplitLayout.VERTICAL]);
        expect(
            calls.slice(verticalFrom).filter(([, layout]) => layout === SplitLayout.VERTICAL),
        ).toEqual([[360, SplitLayout.VERTICAL]]);
        expect(calls.slice(verticalFrom).map(([size]) => size)).not.toContain(0);
    });

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

    test('uses custom main pane ratio', async () => {
        const screen = await render(
            <TestCase
                containerHeight={200}
                containerWidth={400}
                layout={SplitLayout.VERTICAL}
                mainPaneRatio={0.75}
                tooltipHeight={40}
            />,
        );

        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('vertical:300');

        await screen.rerender(
            <TestCase
                containerHeight={200}
                containerWidth={400}
                layout={SplitLayout.VERTICAL}
                mainPaneRatio={0.5}
                tooltipHeight={40}
            />,
        );

        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('vertical:200');
    });

    test('recalculates size and reports only distinct size-layout pairs', async () => {
        const onMainPaneSizeChange = vi.fn().mockResolvedValue(undefined);
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

    test('keeps the main pane minimum and scrolls a long tooltip', async () => {
        const screen = await render(
            <TestCase
                containerHeight={400}
                containerWidth={300}
                minMainPaneSize={120}
                tooltipHeight={800}
                resizerVisible
            />,
        );
        const mainPane = getElement(screen.container, '.Pane1');
        const tooltipPane = getElement(screen.container, '.Pane2');

        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:120');
        expect(mainPane.getBoundingClientRect().height).toBe(120);
        expect(tooltipPane.clientHeight).toBe(256);
        expect(tooltipPane.scrollHeight).toBeGreaterThan(tooltipPane.clientHeight);

        await screen.rerender(
            <TestCase
                containerHeight={200}
                containerWidth={300}
                layout={SplitLayout.HORIZONTAL}
                minMainPaneSize={120}
                tooltipHeight={800}
                resizerVisible
            />,
        );
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:88');
        expect(mainPane.getBoundingClientRect().height).toBe(88);
        expect(tooltipPane.clientHeight).toBe(88);
    });

    test('keeps automatic sizing without a minimum for existing consumers', async () => {
        const screen = await render(
            <TestCase containerHeight={400} containerWidth={300} tooltipHeight={800} />,
        );
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:0');
        await expect.element(getElement(screen.container, '.SplitPane')).toHaveClass('disabled');
    });

    test('reserves tooltip content height when dragging without new options', async () => {
        const renderTestCase = (tooltipHeight: number) => (
            <TestCase
                containerHeight={400}
                containerWidth={300}
                tooltipHeight={tooltipHeight}
                resizerVisible
            />
        );
        const screen = await render(renderTestCase(240));
        const mainPane = getElement(screen.container, '.Pane1');
        const tooltipPane = getElement(screen.container, '.Pane2');
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:136');

        await dragMainPane(screen.container, 220);
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:136');
        expect(mainPane.getBoundingClientRect().height).toBe(136);
        expect(tooltipPane.clientHeight).toBe(240);

        await screen.rerender(renderTestCase(320));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:56');
        await dragMainPane(screen.container, 55);
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:56');
        expect(tooltipPane.clientHeight).toBe(320);

        await screen.rerender(renderTestCase(40));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:336');
        expect(tooltipPane.clientHeight).toBe(40);
    });

    test.each([undefined, 120])(
        'recalculates a manual size with minimum %s when preservation is omitted',
        async (minMainPaneSize) => {
            const renderTestCase = (props?: Partial<TestCaseProps>) => (
                <TestCase
                    containerHeight={400}
                    containerWidth={300}
                    layout={SplitLayout.HORIZONTAL}
                    tooltipHeight={120}
                    minMainPaneSize={minMainPaneSize}
                    resizerVisible
                    {...props}
                />
            );
            const screen = await render(renderTestCase());
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:256');
            await dragMainPane(screen.container, 200);
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:200');

            await screen.rerender(renderTestCase({tooltipHeight: 240}));
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:136');
            await screen.rerender(renderTestCase({tooltipHeight: 800}));
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent(`horizontal:${minMainPaneSize ?? 0}`);
            await screen.rerender(renderTestCase());
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:256');

            await dragMainPane(screen.container, 200);
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:200');
            await screen.rerender(renderTestCase({layout: SplitLayout.VERTICAL}));
            await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('vertical:180');
            await screen.rerender(renderTestCase());
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:256');
        },
    );

    test.each([-1, 1])(
        'does not jump when the first drag moves %i pixel from a small automatic size',
        async (delta) => {
            const renderTestCase = (tooltipHeight: number) => (
                <TestCase
                    containerHeight={400}
                    containerWidth={300}
                    tooltipHeight={tooltipHeight}
                    minMainPaneSize={40}
                    preserveManualSize
                    resizerVisible
                />
            );
            const screen = await render(renderTestCase(320));
            const mainPane = getElement(screen.container, '.Pane1');
            const resizer = getElement(screen.container, '.Resizer');
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:56');
            const initialPosition = resizer.getBoundingClientRect().top + 12;

            resizer.dispatchEvent(
                new MouseEvent('mousedown', {bubbles: true, clientY: initialPosition}),
            );
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            document.dispatchEvent(
                new MouseEvent('mousemove', {bubbles: true, clientY: initialPosition + delta}),
            );
            document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));

            const expectedSize = 56 + delta;
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent(`horizontal:${expectedSize}`);
            expect(mainPane.getBoundingClientRect().height).toBe(expectedSize);

            await screen.rerender(renderTestCase(40));
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent(`horizontal:${expectedSize}`);
        },
    );

    test.each([false, true])(
        'follows asynchronous tooltip growth and shrinkage before dragging with preservation %s',
        async (preserveManualSize) => {
            let resolveHeight!: (height: number) => void;
            const loadedHeight = new Promise<number>((resolve) => {
                resolveHeight = resolve;
            });
            const onMainPaneSizeChange = vi.fn();
            const renderTestCase = (height: Promise<number>) => (
                <TestCase
                    containerHeight={400}
                    containerWidth={300}
                    tooltipHeight={0}
                    minMainPaneSize={120}
                    preserveManualSize={preserveManualSize}
                    onMainPaneSizeChange={onMainPaneSizeChange}
                    renderTooltip={() => <AsyncTooltip loadedHeight={height} />}
                />
            );
            const screen = await render(renderTestCase(loadedHeight));
            await expect
                .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
                .toEqual([336, SplitLayout.HORIZONTAL]);

            resolveHeight(800);
            await expect
                .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
                .toEqual([120, SplitLayout.HORIZONTAL]);

            await screen.rerender(renderTestCase(Promise.resolve(80)));
            await expect
                .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
                .toEqual([296, SplitLayout.HORIZONTAL]);
        },
    );

    test.each([undefined, 120])(
        'allows scrolling and retains the manual size with minimum %s',
        async (minMainPaneSize) => {
            const onMainPaneSizeChange = vi.fn();
            const renderTestCase = (tooltipHeight: number) => (
                <TestCase
                    containerHeight={400}
                    containerWidth={300}
                    tooltipHeight={tooltipHeight}
                    minMainPaneSize={minMainPaneSize}
                    preserveManualSize
                    resizerVisible
                    onMainPaneSizeChange={onMainPaneSizeChange}
                />
            );
            const screen = await render(renderTestCase(240));
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:136');

            await dragMainPane(screen.container, 220);
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:220');
            const tooltipPane = getElement(screen.container, '.Pane2');
            expect(tooltipPane.clientHeight).toBe(156);
            expect(tooltipPane.scrollHeight).toBeGreaterThan(tooltipPane.clientHeight);

            await screen.rerender(renderTestCase(800));
            await expect.poll(() => tooltipPane.scrollHeight).toBeGreaterThanOrEqual(800);
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:220');
            await screen.rerender(renderTestCase(156));
            await dragMainPane(screen.container, 180);
            await dragMainPane(screen.container, 220);
            // A manual size equal to the automatic size must still remain a manual choice.
            await screen.rerender(renderTestCase(40));
            await expect.poll(() => tooltipPane.scrollHeight).toBe(156);
            await expect
                .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
                .toEqual([220, SplitLayout.HORIZONTAL]);
        },
    );

    test('preserves a manual size without an implicit minimum', async () => {
        const renderTestCase = (tooltipHeight: number) => (
            <TestCase
                containerHeight={400}
                containerWidth={300}
                layout={SplitLayout.HORIZONTAL}
                tooltipHeight={tooltipHeight}
                preserveManualSize
                resizerVisible
            />
        );
        const screen = await render(renderTestCase(80));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:296');
        await dragMainPane(screen.container, 20);
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:20');
        await screen.rerender(renderTestCase(800));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:20');
    });

    test.each([
        [SplitLayout.HORIZONTAL, false],
        [SplitLayout.HORIZONTAL, true],
        [SplitLayout.VERTICAL, false],
        [SplitLayout.VERTICAL, true],
    ] as const)(
        'allows the tooltip pane to shrink with visible overflow in %s layout with preservation %s',
        async (layout, preserveManualSize) => {
            const screen = await render(
                <TestCase
                    containerHeight={400}
                    containerWidth={300}
                    layout={layout}
                    tooltipHeight={800}
                    minMainPaneSize={120}
                    preserveManualSize={preserveManualSize}
                    tooltipPaneStyle={{overflow: 'visible'}}
                    resizerVisible
                    renderTooltip={() => <div style={{height: 800, width: 800}}>Tooltip</div>}
                />,
            );
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent(
                    layout === SplitLayout.HORIZONTAL ? 'horizontal:120' : 'vertical:180',
                );
            const tooltipPane = getElement(screen.container, '.Pane2');
            const rect = tooltipPane.getBoundingClientRect();
            if (layout === SplitLayout.HORIZONTAL) {
                expect(rect.height).toBe(256);
                expect(tooltipPane.scrollHeight).toBeGreaterThan(rect.height);
            } else {
                expect(rect.width).toBe(119);
                expect(tooltipPane.scrollWidth).toBeGreaterThan(rect.width);
            }
        },
    );

    test('restores the selected size after the container temporarily constrains it', async () => {
        const renderTestCase = (containerHeight: number) => (
            <TestCase
                containerHeight={containerHeight}
                containerWidth={300}
                layout={SplitLayout.HORIZONTAL}
                tooltipHeight={40}
                minMainPaneSize={120}
                preserveManualSize
                resizerVisible
            />
        );
        const screen = await render(renderTestCase(400));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:336');
        await dragMainPane(screen.container, 260);
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:260');

        await screen.rerender(renderTestCase(200));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:176');
        await screen.rerender(renderTestCase(12));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:0');
        await expect
            .element(screen.container.querySelector<HTMLElement>('.SplitPane'))
            .toHaveClass('disabled');
        await screen.rerender(renderTestCase(400));
        await expect.element(screen.getByTestId('main-pane')).toHaveTextContent('horizontal:260');
    });

    test.each([SplitLayout.HORIZONTAL, SplitLayout.VERTICAL])(
        'fills the container and reports its size when disabled in %s layout',
        async (layout) => {
            const onMainPaneSizeChange = vi.fn();
            const renderTestCase = (containerHeight: number, containerWidth: number) => (
                <TestCase
                    containerHeight={containerHeight}
                    containerWidth={containerWidth}
                    layout={layout}
                    enabled={false}
                    tooltipHeight={800}
                    resizerVisible
                    onMainPaneSizeChange={onMainPaneSizeChange}
                />
            );
            const screen = await render(renderTestCase(400, 300));
            await expect
                .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
                .toEqual([layout === SplitLayout.HORIZONTAL ? 400 : 300, layout]);
            await expect.element(screen.getByTestId('tooltip-pane')).not.toBeVisible();
            await expect
                .element(screen.container.querySelector<HTMLElement>('.Resizer'))
                .not.toBeVisible();
            await expect
                .element(screen.container.querySelector<HTMLElement>('.SplitPane'))
                .toHaveClass('disabled');
            const mainPane = getElement(screen.container, '.Pane1');
            expect(mainPane.getBoundingClientRect().height).toBe(400);
            expect(mainPane.getBoundingClientRect().width).toBe(300);

            await screen.rerender(renderTestCase(500, 350));
            await expect
                .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
                .toEqual([layout === SplitLayout.HORIZONTAL ? 500 : 350, layout]);
        },
    );

    test('preserves the mounted main pane, state and manual size across mode changes and hiding', async () => {
        const onMount = vi.fn();
        const onUnmount = vi.fn();
        const onMainPaneSizeChange = vi.fn();
        const renderTestCase = (props?: Partial<TestCaseProps>) => (
            <TestCase
                containerHeight={400}
                containerWidth={300}
                layout={SplitLayout.HORIZONTAL}
                tooltipHeight={80}
                minMainPaneSize={120}
                preserveManualSize
                resizerVisible
                onMainPaneSizeChange={onMainPaneSizeChange}
                renderMainPane={() => <StatefulMainPane onMount={onMount} onUnmount={onUnmount} />}
                {...props}
            />
        );
        const screen = await render(renderTestCase());
        const originalMainPane = screen.getByTestId('stateful-main-pane').element();
        await screen.getByTestId('stateful-main-pane').click();
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([296, SplitLayout.HORIZONTAL]);
        await dragMainPane(screen.container, 240);
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([240, SplitLayout.HORIZONTAL]);

        await screen.rerender(renderTestCase({enabled: false}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([400, SplitLayout.HORIZONTAL]);
        await screen.rerender(renderTestCase({tooltipHeight: 800}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([240, SplitLayout.HORIZONTAL]);
        await screen.rerender(renderTestCase({layout: SplitLayout.VERTICAL}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([180, SplitLayout.VERTICAL]);
        await screen.rerender(renderTestCase({layout: SplitLayout.VERTICAL, enabled: false}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([300, SplitLayout.VERTICAL]);
        await screen.rerender(renderTestCase({containerHeight: 0, containerWidth: 0}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([0, SplitLayout.HORIZONTAL]);
        await screen.rerender(renderTestCase());
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([240, SplitLayout.HORIZONTAL]);
        await screen.rerender(renderTestCase({hidden: true}));
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([0, SplitLayout.HORIZONTAL]);
        await screen.rerender(renderTestCase());
        await expect
            .poll(() => onMainPaneSizeChange.mock.calls.at(-1))
            .toEqual([240, SplitLayout.HORIZONTAL]);

        expect(screen.getByTestId('stateful-main-pane').element()).toBe(originalMainPane);
        await expect.element(screen.getByTestId('stateful-main-pane')).toHaveTextContent('1');
        expect(onMount).toHaveBeenCalledTimes(1);
        expect(onUnmount).not.toHaveBeenCalled();
    });

    test.each(['disabled', 'vertical'])(
        'cancels an active drag when switching to %s mode',
        async (mode) => {
            const renderTestCase = (props?: Partial<TestCaseProps>) => (
                <TestCase
                    containerHeight={400}
                    containerWidth={300}
                    tooltipHeight={80}
                    minMainPaneSize={120}
                    preserveManualSize
                    resizerVisible
                    {...props}
                />
            );
            const screen = await render(renderTestCase());
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:296');
            const resizer = getElement(screen.container, '.Resizer');
            resizer.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, clientY: 308}));
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            document.dispatchEvent(new MouseEvent('mousemove', {bubbles: true, clientY: 252}));
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:240');
            await screen.rerender(
                renderTestCase(
                    mode === 'disabled' ? {enabled: false} : {layout: SplitLayout.VERTICAL},
                ),
            );
            await screen.rerender(renderTestCase());
            document.dispatchEvent(new MouseEvent('mousemove', {bubbles: true, clientY: 200}));
            document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, clientY: 200}));
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            await expect
                .element(screen.getByTestId('main-pane'))
                .toHaveTextContent('horizontal:240');
        },
    );
});
