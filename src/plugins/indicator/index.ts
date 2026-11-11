import React from 'react';

import {ChartKitPlugin} from '../../types';

export * from './types';
export type {FormatNumberOptions} from '../shared';

export const IndicatorPlugin: ChartKitPlugin = {
    type: 'indicator',
    renderer: React.lazy(() =>
        import('./renderer/IndicatorWidget.js').then((module) => ({
            default: module.IndicatorWidget,
        })),
    ),
};
