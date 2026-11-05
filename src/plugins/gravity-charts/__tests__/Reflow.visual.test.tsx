import React from 'react';

import {vi} from 'vitest';

import {render} from '../../../../test-utils/utils';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import type {ChartKitRef} from '../../../types';
import {GravityChartsPlugin} from '../index';

const {reflow} = vi.hoisted(() => ({reflow: vi.fn()}));

vi.mock('@gravity-ui/charts', async (importOriginal) => {
    const original = await importOriginal<typeof import('@gravity-ui/charts')>();
    const React = await import('react');
    return {
        ...original,
        Chart: React.forwardRef(function Chart(_props, ref) {
            React.useImperativeHandle(ref, () => ({reflow}));
            return React.createElement('div', {}, 'Rendered chart');
        }),
    };
});

const DATA = {series: {data: [{type: 'line' as const, name: 'Line', data: [{x: 0, y: 1}]}]}};

describe('Gravity Charts reflow forwarding', () => {
    beforeEach(() => {
        reflow.mockReset().mockResolvedValue(undefined);
        settings.set({plugins: [GravityChartsPlugin]});
    });

    test.each([false, true])(
        'preserves exact completion promise (split tooltip: %s)',
        async (splitted) => {
            let complete!: () => void;
            const completion = new Promise<void>((resolve) => {
                complete = resolve;
            });
            reflow.mockReturnValue(completion);
            const ref = React.createRef<ChartKitRef>();
            const screen = await render(
                <div style={{width: 800, height: 500}}>
                    <ChartKit ref={ref} type="gravity-charts" data={DATA} tooltip={{splitted}} />
                </div>,
            );
            await expect.element(screen.getByText('Rendered chart')).toBeVisible();
            const options = {immediate: true};
            expect(ref.current?.reflow(options)).toBe(completion);
            expect(reflow).toHaveBeenLastCalledWith(options);
            complete();
            await completion;
        },
    );

    test.each([false, true])(
        'preserves rejection cause without replacing handled promise (split tooltip: %s)',
        async (splitted) => {
            const onError = vi.fn();
            const ref = React.createRef<ChartKitRef>();
            const screen = await render(
                <div style={{width: 800, height: 500}}>
                    <ChartKit
                        ref={ref}
                        type="gravity-charts"
                        data={DATA}
                        tooltip={{splitted}}
                        onError={onError}
                    />
                </div>,
            );
            await expect.element(screen.getByText('Rendered chart')).toBeVisible();

            for (const message of [
                'Chart host is unavailable',
                'Chart host has zero size',
                'Chart is unmounted',
                'Chart unmounted before reflow completed',
            ]) {
                const cancellation = new Error(message);
                await React.act(async () => {
                    const cancelled = Promise.reject<void>(cancellation);
                    reflow.mockReturnValue(cancelled);
                    expect(ref.current?.reflow()).toBe(cancelled);
                    await expect(cancelled).rejects.toBe(cancellation);
                });
                expect(onError).not.toHaveBeenCalled();
                await expect.element(screen.getByText('Rendered chart')).toBeVisible();
            }

            const failure = new Error('chart preparation failed');
            const completion = Promise.reject<void>(failure);
            reflow.mockReturnValue(completion);
            const result = ref.current?.reflow();
            expect(result).toBe(completion);
            await expect(result).rejects.toBe(failure);
            await expect.element(screen.getByText(failure.message)).toBeVisible();
            expect(onError).toHaveBeenCalledWith({error: failure});
        },
    );

    test('rejects a split reflow when its chart has no host size', async () => {
        const ref = React.createRef<ChartKitRef>();
        await render(
            <div style={{width: 800, height: 0}}>
                <ChartKit ref={ref} type="gravity-charts" data={DATA} tooltip={{splitted: true}} />
            </div>,
        );
        await vi.waitFor(() => {
            expect(ref.current?.reflow()).toBeInstanceOf(Promise);
        });
        await expect(ref.current?.reflow()).rejects.toThrow('Chart host is unavailable');
    });

    test('keeps legacy void renderer and details forwarding', async () => {
        const legacyReflow = vi.fn();
        const LegacyWidget = React.forwardRef(function LegacyWidget(_props, ref) {
            React.useImperativeHandle(ref, () => ({reflow: legacyReflow}));
            return <div>Legacy chart</div>;
        });
        settings.set({
            plugins: [
                {
                    type: 'gravity-charts',
                    renderer: React.lazy(async () => ({default: LegacyWidget})),
                },
            ],
        });
        const ref = React.createRef<ChartKitRef>();
        const screen = await render(<ChartKit ref={ref} type="gravity-charts" data={DATA} />);
        await expect.element(screen.getByText('Legacy chart')).toBeVisible();
        const details = {reason: 'resize'};
        expect(ref.current?.reflow(details)).toBeUndefined();
        expect(legacyReflow).toHaveBeenCalledWith(details);
    });
});
