import React from 'react';

import type {ChartKitPlugin} from '../../types';

export * from './types';
export {HighchartsReact} from './renderer/components/HighchartsReact';

export const HighchartsPlugin: ChartKitPlugin = {
    type: 'highcharts',
    // The named export loads the same in the ESM build and in the CommonJS build, where the
    // dynamic import becomes `require` and `default` would be the whole module.
    renderer: React.lazy(() =>
        import('./renderer/HighchartsWidget.js').then((module) => ({
            default: module.HighchartsWidget,
        })),
    ),
};
