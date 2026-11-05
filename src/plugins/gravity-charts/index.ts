import React from 'react';

import {ChartKitPlugin} from '../../types';

export {ChartTooltipContent, CustomShapeRenderer} from '@gravity-ui/charts';
export * from './types';

export const GravityChartsPlugin: ChartKitPlugin = {
    type: 'gravity-charts',
    // The named export loads the same in the ESM build and in the CommonJS build, where the
    // dynamic import becomes `require` and `default` would be the whole module.
    renderer: React.lazy(() =>
        import('./renderer/GravityChartsWidget.js').then((module) => ({
            default: module.GravityChartsWidget,
        })),
    ),
};
