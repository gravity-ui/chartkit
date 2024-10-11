import type {ChartKitWidgetLegend} from '../../../../../types';

export const legendDefaults = {
    align: 'center' as Required<ChartKitWidgetLegend>['align'],
    itemDistance: 20,
    margin: 15,
    itemStyle: {
        fontSize: '12px',
    },
};

export const GRADIENT_LEGEND_SIZE = {
    height: 12,
    width: 200,
};
