import React from 'react';

import {ChartKitPlugin} from '../../types';

export {ChartTooltipContent, CustomShapeRenderer} from '@gravity-ui/charts';
export {inspectChartDataV1, migrateChartDataV1} from '@gravity-ui/charts/migration/v1';
export * from './types';

export const GravityChartsPlugin: ChartKitPlugin = {
    type: 'gravity-charts',
    renderer: React.lazy(() =>
        import('./renderer/GravityChartsWidget.js').then((module) => ({
            default: module.GravityChartsWidget,
        })),
    ),
};
