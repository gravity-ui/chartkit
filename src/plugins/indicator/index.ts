import React from 'react';

import {ChartKitPlugin} from '../../types';

export type {IndicatorWidgetData, IndicatorWidgetDataItem} from './public-types';

export const IndicatorPlugin: ChartKitPlugin = {
    type: 'indicator',
    renderer: React.lazy(() =>
        import('./renderer/IndicatorWidget.js').then((module) => ({
            default: module.IndicatorWidget,
        })),
    ),
};
