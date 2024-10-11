import type {ChartKitWidgetLegend} from '../../../../../types';

type LegendDefaults = Required<Omit<ChartKitWidgetLegend, 'enabled'>> &
    Pick<ChartKitWidgetLegend, 'enabled'>;

export const legendDefaults: LegendDefaults = {
    align: 'center',
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
