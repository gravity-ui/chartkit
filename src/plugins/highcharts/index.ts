import React from 'react';
import type {ChartKitPlugin} from '../../types';

export * from './types';
export {HighchartsReact} from './renderer/components/HighchartsReact';

export const HighchartsPlugin: ChartKitPlugin = {
    type: 'highcharts',
    renderer: React.lazy(() => import('./renderer/HighchartsWidget')),
};
