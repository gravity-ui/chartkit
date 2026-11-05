import React from 'react';

import type {ChartKitPlugin} from '../../types';

export * from './types';
export {HighchartsReact} from './renderer/components/HighchartsReact';

export const HighchartsPlugin: ChartKitPlugin = {
    type: 'highcharts',
    // The CommonJS build type-checks with `moduleResolution: nodenext`: a dynamic import needs
    // the `.js` extension there (the build adds extensions only after the check), and the
    // module it imports is typed as `{default: typeof module}`, so only a named export
    // type-checks as the component. The build then rewrites `import()` to `require` for
    // CommonJS and keeps it in ESM for the bundlers to split.
    renderer: React.lazy(() =>
        import('./renderer/HighchartsWidget.js').then((module) => ({
            default: module.HighchartsWidget,
        })),
    ),
};
