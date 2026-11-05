import React from 'react';

import {render} from '../../../../test-utils/utils.js';
import {SplitPane} from '../SplitPane.js';
import type {SplitLayoutType} from '../types.js';

describe('SplitPane drag callbacks', () => {
    test.each(['mouseup', 'disabled', 'vertical'] as const)(
        'finishes a drag once when ending through %s',
        async (mode) => {
            const onDragStarted = vi.fn();
            const onDragFinished = vi.fn();
            const renderTestCase = (
                size = 200,
                allowResize = true,
                split: SplitLayoutType = 'horizontal',
            ) => (
                <div style={{position: 'relative', height: 400, width: 300}}>
                    <SplitPane
                        allowResize={allowResize}
                        split={split}
                        size={size}
                        onDragStarted={onDragStarted}
                        onDragFinished={onDragFinished}
                    >
                        <div>Main</div>
                        <div>Tooltip</div>
                    </SplitPane>
                </div>
            );
            const screen = await render(renderTestCase());
            const resizer = screen.container.querySelector<HTMLElement>('.Resizer');
            const mainPane = screen.container.querySelector<HTMLElement>('.Pane1');
            if (!resizer || !mainPane) throw new Error('Expected split panes and resizer');

            resizer.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, clientY: 200}));
            await expect.poll(() => onDragStarted.mock.calls.length).toBe(1);
            document.dispatchEvent(new MouseEvent('mousemove', {bubbles: true, clientY: 240}));
            await expect.poll(() => mainPane.getBoundingClientRect().height).toBe(240);

            if (mode === 'disabled') await screen.rerender(renderTestCase(400, false));
            if (mode === 'vertical') await screen.rerender(renderTestCase(180, true, 'vertical'));
            document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            await expect.poll(() => onDragFinished.mock.calls).toEqual([[240]]);

            await screen.rerender(renderTestCase());
            document.dispatchEvent(new MouseEvent('mousemove', {bubbles: true, clientY: 280}));
            document.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            expect(onDragStarted).toHaveBeenCalledTimes(1);
            expect(onDragFinished).toHaveBeenCalledTimes(1);
        },
    );
});
