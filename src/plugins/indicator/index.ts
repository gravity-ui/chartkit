import React from 'react';
import {ChartKitPlugin} from '../../types';

export * from './types';

export const IndicatorPlugin: ChartKitPlugin = {
    type: 'indicator',
    renderer: React.lazy(() => import('./renderer/IndicatorWidget')),
};
