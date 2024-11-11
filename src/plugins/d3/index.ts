import React from 'react';

import {ChartKitPlugin} from '../../types';

export {CustomShapeRenderer} from '@gravity-ui/charts';
export * from './types';
/**
 * It is an experemental plugin
 *
 * DO NOT USE IT IN YOUR PRODUCTION
 * */
export const D3Plugin: ChartKitPlugin = {
    // TODO: rename to 'gravity-chart' in the next major
    type: 'd3',
    renderer: React.lazy(() => import('./renderer/D3Widget')),
};
