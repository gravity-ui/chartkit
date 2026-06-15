// Regression tests for the custom tooltip formatter override (libraryConfig.tooltip.formatter).
//
// Background: prepareConfig used to `delete options.highcharts.tooltip.formatter`, mutating the
// caller's libraryConfig. The override then worked only on the FIRST config build; any later
// build reusing the same libraryConfig reference fell back to the default ChartKit tooltip.
// React 18+ StrictMode double-mounts components in dev (mount -> unmount -> remount), which is
// exactly such a "second build with the same config" — so the override silently broke after a
// React 17 -> 19 upgrade.
//
// These run in the browser (visual) project because prepareConfig / HighchartsComponent need `window`.

import React, {StrictMode} from 'react';

import {render} from '../../../../test-utils/utils';
import {ChartKit} from '../../../components/ChartKit';
import {settings} from '../../../libs';
import {HighchartsPlugin} from '../index';
import {data as lineMock} from '../mocks/line';
import {prepareConfig} from '../renderer/helpers/config/config';

settings.set({lang: 'en'});

const CUSTOM_TOOLTIP = 'CUSTOM-TOOLTIP-OVERRIDE';

function callTooltipFormatter(config: {tooltip: {formatter: (tooltip: unknown) => string}}) {
    const fakeThis = {series: {type: 'line'}};
    const fakeTooltip = {
        splitTooltip: false,
        chart: {options: {chart: {type: 'line'}}, userOptions: {_getComments: () => []}},
        defaultFormatter: () => ['DEFAULT'],
    };
    return config.tooltip.formatter.call(fakeThis, fakeTooltip);
}

describe('highcharts custom tooltip formatter override', () => {
    test('prepareConfig: survives repeated builds and does not mutate libraryConfig', () => {
        const libraryConfig = {
            chart: {type: 'line'},
            tooltip: {formatter: () => CUSTOM_TOOLTIP},
        };

        const first = prepareConfig(lineMock.data, {highcharts: libraryConfig}) as ReturnType<
            typeof prepareConfig
        > & {tooltip: {formatter: (tooltip: unknown) => string}};
        const second = prepareConfig(lineMock.data, {highcharts: libraryConfig}) as typeof first;

        expect(callTooltipFormatter(first)).toContain(CUSTOM_TOOLTIP);
        // Regression: the second build with the SAME object used to fall back to the default tooltip.
        expect(callTooltipFormatter(second)).toContain(CUSTOM_TOOLTIP);
        // The caller's libraryConfig must not be mutated.
        expect(typeof libraryConfig.tooltip.formatter).toBe('function');
    });

    test('component: rendering under StrictMode does not consume tooltip.formatter', async () => {
        settings.set({plugins: [HighchartsPlugin]});

        // The same reference is reused across StrictMode's mount -> unmount -> remount cycle,
        // mirroring a module-level libraryConfig shared between renders.
        const sharedLibraryConfig = {
            chart: {type: 'line'},
            tooltip: {formatter: () => CUSTOM_TOOLTIP},
        };
        const chartData = {data: lineMock.data, libraryConfig: sharedLibraryConfig};

        await render(
            <StrictMode>
                <div style={{width: 600, height: 400}}>
                    <ChartKit
                        id="hc-tooltip-formatter"
                        type="highcharts"
                        data={chartData as never}
                    />
                </div>
            </StrictMode>,
        );

        // Wait until HighchartsComponent has mounted (getDerivedStateFromProps -> prepareConfig ran).
        await vi.waitFor(() => {
            expect(document.querySelector('.chartkit-graph')).toBeTruthy();
        });

        // Root cause: the shared libraryConfig must still carry the formatter after rendering.
        expect(typeof sharedLibraryConfig.tooltip.formatter).toBe('function');
    });
});
