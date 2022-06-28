import React from 'react';
import {ChartKitPlugin} from '../../types';

export const YagrPlugin: ChartKitPlugin = {
    type: 'yagr',
    renderer: React.lazy(() => import('./renderer/YagrWidget')),
};
