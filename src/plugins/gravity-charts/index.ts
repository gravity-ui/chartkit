import React from 'react';

import {ChartKitPlugin} from '../../types';

export {CustomShapeRenderer} from '@gravity-ui/charts';
export * from './types';
/**
 * It is an experemental plugin
 *
 * DO NOT USE IT IN YOUR PRODUCTION
 * */
export const GravityChartsPlugin: ChartKitPlugin = {
    type: 'gravity-charts',
    renderer: React.lazy(() => import('./renderer/GravityChartsWidget')),
};
