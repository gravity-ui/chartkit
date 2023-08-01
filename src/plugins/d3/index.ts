import React from 'react';
import {ChartKitPlugin} from '../../types';

export const D3Plugin: ChartKitPlugin = {
    type: 'd3',
    renderer: React.lazy(() => import('./renderer/D3Widget')),
};
