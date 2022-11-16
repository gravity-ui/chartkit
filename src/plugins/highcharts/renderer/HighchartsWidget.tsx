import React from 'react';
import type {ChartKitWidgetRef} from '../../../types';
import type {HighchartsWidgetProps} from '../types';
import {HighchartsComponent} from './components/HighchartsComponent';

const HighchartsWidget = React.forwardRef<ChartKitWidgetRef | undefined, HighchartsWidgetProps>(
    function HighchartsWidgetInner(props, ref) {
        return <HighchartsComponent ref={ref as React.LegacyRef<HighchartsComponent>} {...props} />;
    },
);

export default HighchartsWidget;
