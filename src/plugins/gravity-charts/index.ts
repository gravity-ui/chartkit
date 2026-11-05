import React from 'react';

import {ChartKitPlugin} from '../../types';

export {ChartTooltipContent, CustomShapeRenderer} from '@gravity-ui/charts';
export * from './types';

export const GravityChartsPlugin: ChartKitPlugin = {
    type: 'gravity-charts',
    // The CommonJS build type-checks with `moduleResolution: nodenext`: a dynamic import needs
    // the `.js` extension there (the build adds extensions only after the check), and the
    // module it imports is typed as `{default: typeof module}`, so only a named export
    // type-checks as the component. The build then rewrites `import()` to `require` for
    // CommonJS and keeps it in ESM for the bundlers to split.
    renderer: React.lazy(() =>
        import('./renderer/GravityChartsWidget.js').then((module) => ({
            default: module.GravityChartsWidget,
        })),
    ),
};
