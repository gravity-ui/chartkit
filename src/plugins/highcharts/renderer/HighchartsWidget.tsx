import React from 'react';
import type {ChartKitWidgetRef} from '../../../types';
import type {HighchartsWidgetProps} from '../types';
import {HighchartsComponent} from './components/HighchartsComponent';

const HighchartsWidget = React.forwardRef<ChartKitWidgetRef | undefined, HighchartsWidgetProps>(
    // _ref needs to avoid this React warning:
    // "forwardRef render functions accept exactly two parameters: props and ref"
    function HighchartsWidgetInner(props, _ref) {
        return <HighchartsComponent {...props} />;
    },
);

export default HighchartsWidget;
