import React from 'react';

import {render} from '../../../../test-utils/utils.js';
import {ChartKit} from '../../../components/ChartKit.js';
import {settings} from '../../../libs/index.js';
import {IndicatorPlugin} from '../index.js';
import type {IndicatorWidgetData} from '../types.js';

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
        const screen = await render(
            <div data-qa="indicator-secondary-wrapper" style={{height: 300, width: '100%'}}>
                <ChartKit
                    type="indicator"
                    data={{
                        data: [
                            {
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
                                    arrow: 'up',
                                },
                            },
                        ],
                    }}
                />
            </div>,
            options,
        );

        await expect.element(screen.getByText('+12.4%', {exact: true})).toBeVisible();
        await expect(screen.getByTestId('indicator-secondary-wrapper')).toMatchScreenshot();
    });
});
