import React from 'react';

import {ChartKitPlugin} from '../../types';

export {CustomShapeRenderer} from '@gravity-ui/charts';
export * from './types';

export const GravityChartsPlugin: ChartKitPlugin = {
    type: 'gravity-charts',
    renderer: React.lazy(() => import('./renderer/GravityChartsWidget')),
};
