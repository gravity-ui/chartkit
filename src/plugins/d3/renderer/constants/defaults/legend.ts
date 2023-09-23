import type {ChartKitWidgetLegend} from '../../../../../types';

type LegendDefaults = Required<Omit<ChartKitWidgetLegend, 'enabled'>> &
    Pick<ChartKitWidgetLegend, 'enabled'>;

export const legendDefaults: LegendDefaults = {
    align: 'center',
    itemDistance: 20,
    margin: 12,
    itemStyle: {
        fontSize: '12px',
    },
};
