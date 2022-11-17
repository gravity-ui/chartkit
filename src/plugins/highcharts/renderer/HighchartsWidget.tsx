import React from 'react';
import type {ChartKitWidgetRef, ChartKitProps} from '../../../types';
import {HighchartsComponent} from './components/HighchartsComponent';

const HighchartsWidget = React.forwardRef<
    ChartKitWidgetRef | undefined,
    ChartKitProps<'highcharts'>
>(function HighchartsWidgetInner(props, ref) {
    return <HighchartsComponent ref={ref as React.LegacyRef<HighchartsComponent>} {...props} />;
});

export default HighchartsWidget;
