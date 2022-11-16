import React from 'react';
import type {ChartKitPlugin} from '../../types';

export const HighchartsPlugin: ChartKitPlugin = {
    type: 'highcharts',
    renderer: React.lazy(() => import('./renderer/HighchartsWidget')),
};
