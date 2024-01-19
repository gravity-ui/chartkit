import React from 'react';
import {ChartKitPlugin} from '../../types';

export * from './types';
export * from './utils';
/**
 * It is an experemental plugin
 *
 * DO NOT USE IT IN YOUR PRODUCTION
 * */
export const D3Plugin: ChartKitPlugin = {
    type: 'd3',
    renderer: React.lazy(() => import('./renderer/D3Widget')),
};
