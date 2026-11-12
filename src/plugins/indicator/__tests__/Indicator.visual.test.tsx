import React from 'react';

import {render} from '../../../../test-utils/utils.js';
import {ChartKit} from '../../../components/ChartKit.js';
import {settings} from '../../../libs/index.js';
import {IndicatorPlugin} from '../index.js';
import type {IndicatorWidgetData, IndicatorWidgetDataItem} from '../types.js';

const indicatorData: IndicatorWidgetData = {
    data: [
        {
            content: {
                current: {
                    value: 1539577973,
                },
            },
            title: 'Value title',
            size: 'm',
            color: '#4da2f1',
        },
    ],
};

describe('Indicator visual tests', () => {
    const options = {providers: {theme: 'light'}};

    test('default state', async () => {
        settings.set({plugins: [IndicatorPlugin]});

        const screen = await render(
            <div data-qa="indicator-wrapper" style={{height: 300, width: '100%'}}>
                <ChartKit id="indicator-1" type="indicator" data={indicatorData} />
            </div>,
            options,
        );

        await expect.element(screen.getByText('1539577973')).toBeVisible();
        await expect(screen.getByTestId('indicator-wrapper')).toMatchScreenshot();

        const legacyMarkup = screen.container.querySelector('.chartkit-indicator')?.innerHTML;
        await screen.rerender(
            <div data-qa="indicator-wrapper" style={{height: 300, width: '100%'}}>
                <ChartKit
                    id="indicator-1"
                    type="indicator"
                    data={{
                        data: [
                            {
                                primaryValue: {value: 1539577973, color: '#4da2f1'},
                                title: 'Value title',
                                size: 'm',
                            },
                        ],
                    }}
                />
            </div>,
        );
        await expect.element(screen.getByText('1539577973')).toBeVisible();
        expect(screen.container.querySelector('.chartkit-indicator')?.innerHTML).toBe(legacyMarkup);
    });

    test('no data state', async () => {
        settings.set({plugins: [IndicatorPlugin]});

        const emptyData: IndicatorWidgetData = {
            data: [],
        };

        const screen = await render(
            <div style={{height: 300, width: '100%'}}>
                <ChartKit id="indicator-empty" type="indicator" data={emptyData} />
            </div>,
            options,
        );

        await expect.element(screen.getByText('No data')).toBeVisible();
    });

    test('secondary value', async () => {
        settings.set({plugins: [IndicatorPlugin]});
        const item = {
            title: 'Revenue',
            content: {current: {value: 1200}},
            secondaryValue: {
                value: 0.124,
                numberFormat: {
                    format: 'percent',
                    precision: 1,
                    signDisplay: 'exceptZero',
                },
                position: 'right',
                caption: 'vs the previous month',
                color: 'var(--g-color-text-positive)',
                view: 'badge',
                arrow: {direction: 'up', ariaLabel: 'Increase'},
            },
        } satisfies IndicatorWidgetDataItem;
        const renderIndicator = (
            dataItem: IndicatorWidgetDataItem,
            width: number | string = '100%',
        ) => (
            <div data-qa="indicator-secondary-wrapper" style={{height: 300, width}}>
                <ChartKit type="indicator" data={{data: [dataItem]}} />
            </div>
        );
        const screen = await render(renderIndicator(item), options);

        await expect.element(screen.getByText('+12.4%', {exact: true})).toBeVisible();
        await expect.element(screen.getByRole('img', {name: 'Increase'})).toBeVisible();
        await expect(screen.getByTestId('indicator-secondary-wrapper')).toMatchScreenshot();

        const legacyMarkup = screen.container.querySelector('.chartkit-indicator')?.innerHTML;
        await screen.rerender(
            renderIndicator({
                title: 'Revenue',
                primaryValue: {value: 1200},
                secondaryValue: {
                    value: 0.124,
                    numberFormat: {format: 'percent', precision: 1, signDisplay: 'exceptZero'},
                    position: 'right',
                    caption: 'vs the previous month',
                    color: 'var(--g-color-text-positive)',
                    view: 'badge',
                    arrow: {direction: 'up', ariaLabel: 'Increase'},
                },
            }),
        );
        await expect.element(screen.getByRole('img', {name: 'Increase'})).toBeVisible();
        expect(screen.container.querySelector('.chartkit-indicator')?.innerHTML).toBe(legacyMarkup);

        for (const {width, size} of [
            {width: 300, size: 'm'},
            {width: 400, size: 'xl'},
            {width: 100, size: 'm'},
        ] as const) {
            await screen.rerender(
                renderIndicator(
                    {
                        ...item,
                        size,
                        content: {current: {value: 1539577973}},
                    },
                    width,
                ),
            );

            const text = screen.getByText('+12.4%', {exact: true}).element();
            const secondary = screen.container.querySelector(
                '.chartkit-indicator__secondary-value',
            );
            const caption = screen.getByText('vs the previous month', {exact: true}).element();
            const scrollable = screen.container.querySelector('.chartkit-indicator__content');
            if (!secondary || !scrollable) {
                throw new Error('Indicator content is missing');
            }

            const secondaryRect = secondary.getBoundingClientRect();
            const textRect = text.getBoundingClientRect();
            expect(textRect.left).toBeGreaterThanOrEqual(secondaryRect.left);
            expect(textRect.right).toBeLessThanOrEqual(secondaryRect.right);
            expect(caption.getBoundingClientRect().width).toBeGreaterThan(0);
            expect(caption.getAttribute('title')).toBe('vs the previous month');
            expect(scrollable.scrollWidth).toBeGreaterThan(scrollable.clientWidth);

            scrollable.scrollLeft = scrollable.scrollWidth;
            await expect
                .poll(() => {
                    const viewport = scrollable.getBoundingClientRect();
                    const value = text.getBoundingClientRect();
                    const captionRect = caption.getBoundingClientRect();
                    return (
                        value.left >= viewport.left &&
                        value.right <= viewport.right &&
                        captionRect.left >= viewport.left &&
                        captionRect.right <= viewport.right
                    );
                })
                .toBe(true);
        }
    });

    test('secondary value below: text with a downward arrow', async () => {
        settings.set({plugins: [IndicatorPlugin], lang: 'en'});

        const screen = await render(
            <div data-qa="indicator-secondary-wrapper" style={{height: 300, width: '100%'}}>
                <ChartKit
                    type="indicator"
                    data={{
                        data: [
                            {
                                title: 'Revenue',
                                primaryValue: {value: 1200},
                                secondaryValue: {
                                    value: -0.124,
                                    numberFormat: {format: 'percent', precision: 1},
                                    caption: 'vs the previous month',
                                    arrow: {direction: 'down', ariaLabel: 'Decrease'},
                                    color: 'var(--g-color-text-danger)',
                                },
                            },
                        ],
                    }}
                />
            </div>,
            options,
        );

        await expect.element(screen.getByText('-12.4%', {exact: true})).toBeVisible();
        await expect.element(screen.getByRole('img', {name: 'Decrease'})).toBeVisible();

        const mainRect = screen.getByText('1200', {exact: true}).element().getBoundingClientRect();
        const secondaryRect = screen
            .getByText('-12.4%', {exact: true})
            .element()
            .getBoundingClientRect();
        expect(secondaryRect.top).toBeGreaterThanOrEqual(mainRect.bottom);

        await expect(screen.getByTestId('indicator-secondary-wrapper')).toMatchScreenshot();
    });

    test('secondary value below: badge without color or caption', async () => {
        settings.set({plugins: [IndicatorPlugin], lang: 'en'});

        const screen = await render(
            <div data-qa="indicator-secondary-wrapper" style={{height: 300, width: '100%'}}>
                <ChartKit
                    type="indicator"
                    data={{
                        data: [
                            {
                                title: 'Revenue',
                                primaryValue: {value: 1200},
                                secondaryValue: {value: '12.4%', view: 'badge'},
                            },
                        ],
                    }}
                />
            </div>,
            options,
        );

        await expect.element(screen.getByText('12.4%', {exact: true})).toBeVisible();

        const mainRect = screen.getByText('1200', {exact: true}).element().getBoundingClientRect();
        const secondaryRect = screen
            .getByText('12.4%', {exact: true})
            .element()
            .getBoundingClientRect();
        expect(secondaryRect.top).toBeGreaterThanOrEqual(mainRect.bottom);

        await expect(screen.getByTestId('indicator-secondary-wrapper')).toMatchScreenshot();
    });

    test('independent number formats', async () => {
        settings.set({plugins: [IndicatorPlugin], lang: 'en'});
        const formatNumber = vi.fn((_value: number, _options?: unknown) => 'custom result');
        const current = {
            value: 1234.56,
            precision: 2,
            customMetadata: 'main value',
        };
        const mainNumberFormat = {precision: 0, showRankDelimiter: true, postfix: ' USD'};
        const secondaryValue: NonNullable<IndicatorWidgetDataItem['secondaryValue']> = {
            value: 0.124,
            numberFormat: {format: 'percent', precision: 1, signDisplay: 'exceptZero'},
        };
        const renderIndicator = (item: IndicatorWidgetDataItem) => (
            <div data-qa="indicator-formats-wrapper" style={{height: 300, width: '100%'}}>
                <ChartKit type="indicator" data={{data: [item]}} formatNumber={formatNumber} />
            </div>
        );
        const screen = await render(
            renderIndicator({
                primaryValue: {...current, numberFormat: mainNumberFormat},
                secondaryValue,
            }),
            options,
        );

        await expect.element(screen.getByText('1,235 USD', {exact: true})).toBeVisible();
        await expect.element(screen.getByText('+12.4%', {exact: true})).toBeVisible();
        expect(formatNumber).not.toHaveBeenCalled();
        await expect(screen.getByTestId('indicator-formats-wrapper')).toMatchScreenshot();

        await screen.rerender(renderIndicator({content: {current}, secondaryValue}));

        await expect.element(screen.getByText('custom result', {exact: true})).toBeVisible();
        await expect.element(screen.getByText('+12.4%', {exact: true})).toBeVisible();
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(current.value, current);
        expect(formatNumber.mock.calls[0][1]).toBe(current);

        formatNumber.mockClear();
        await screen.rerender(
            renderIndicator({
                primaryValue: {...current, numberFormat: mainNumberFormat},
                secondaryValue: {value: secondaryValue.value},
            }),
        );

        await expect.element(screen.getByText('1,235 USD', {exact: true})).toBeVisible();
        await expect.element(screen.getByText('custom result', {exact: true})).toBeVisible();
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(secondaryValue.value, {
            value: secondaryValue.value,
        });

        formatNumber.mockClear();
        const primaryValue = {value: 0, customMetadata: 'new value'};
        await screen.rerender(renderIndicator({primaryValue, secondaryValue}));
        await expect.element(screen.getByText('custom result', {exact: true})).toBeVisible();
        expect(formatNumber).toHaveBeenCalledExactlyOnceWith(0, primaryValue);
        expect(formatNumber.mock.calls[0][1]).toBe(primaryValue);
    });

    test('legacy formatter metadata does not override the default color', async () => {
        settings.set({plugins: [IndicatorPlugin]});
        const current = {
            value: 42,
            color: 'red',
            numberFormat: 'formatter metadata',
            customMetadata: 'legacy',
        };
        const formatNumber = vi.fn((value: number, _options?: unknown) => String(value));
        const screen = await render(
            <ChartKit
                type="indicator"
                formatNumber={formatNumber}
                data={{
                    defaultColor: 'blue',
                    data: [{content: {current}}],
                }}
            />,
            options,
        );
        await expect.element(screen.getByText('42', {exact: true})).toBeVisible();
        expect(screen.getByText('42', {exact: true}).element().getAttribute('style')).toBe(
            'color: blue;',
        );
        expect(formatNumber.mock.calls[0][1]).toBe(current);
    });

    test('updates when a new configuration reuses the data array', async () => {
        settings.set({plugins: [IndicatorPlugin]});
        const items: IndicatorWidgetDataItem[] = [
            {
                content: {current: {value: 42}},
                color: 'red',
                title: 'Before',
            },
        ];
        const screen = await render(<ChartKit type="indicator" data={{data: items}} />, options);
        await expect.element(screen.getByText('42', {exact: true})).toBeVisible();

        items[0] = {content: {current: {value: 43}}, color: 'blue', title: 'After'};
        await screen.rerender(<ChartKit type="indicator" data={{data: items}} />);

        await expect.element(screen.getByText('43', {exact: true})).toBeVisible();
        await expect.element(screen.getByText('After', {exact: true})).toBeVisible();
        expect(screen.getByText('43', {exact: true}).element().getAttribute('style')).toBe(
            'color: blue;',
        );
    });

    test('updates formatted values when only the formatter changes', async () => {
        settings.set({plugins: [IndicatorPlugin]});
        const current = {value: 42, numberFormat: {precision: 2}, customMetadata: 'source'};
        const config = {data: [{content: {current}, secondaryValue: {value: 7}}]};
        const firstFormatter = vi.fn((value: number, _options?: unknown) => `first:${value}`);
        const screen = await render(
            <ChartKit type="indicator" data={config} formatNumber={firstFormatter} />,
            options,
        );
        await expect.element(screen.getByText('first:42', {exact: true})).toBeVisible();
        await expect.element(screen.getByText('first:7', {exact: true})).toBeVisible();
        expect(firstFormatter.mock.calls[0][1]).toBe(current);
        firstFormatter.mockClear();

        const nextFormatter = vi.fn((value: number, _options?: unknown) => `next:${value}`);
        await screen.rerender(
            <ChartKit type="indicator" data={config} formatNumber={nextFormatter} />,
        );
        await expect.element(screen.getByText('next:42', {exact: true})).toBeVisible();
        await expect.element(screen.getByText('next:7', {exact: true})).toBeVisible();
        expect(firstFormatter).not.toHaveBeenCalled();
        expect(nextFormatter.mock.calls).toEqual([
            [42, current],
            [7, {value: 7}],
        ]);
        expect(nextFormatter.mock.calls[0][1]).toBe(current);
    });
});
