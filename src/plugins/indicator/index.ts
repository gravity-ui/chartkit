import React from 'react';

import {ChartKitPlugin} from '../../types';

export * from './types';

export const IndicatorPlugin: ChartKitPlugin = {
    type: 'indicator',
    // The named export loads the same in the ESM build and in the CommonJS build, where the
    // dynamic import becomes `require` and `default` would be the whole module.
    renderer: React.lazy(() =>
        import('./renderer/IndicatorWidget.js').then((module) => ({
            default: module.IndicatorWidget,
        })),
    ),
};
