import {ChartKitWidgetSeries, RectLegendSymbolOptions} from '../../../../../types/widget-data';

export type RectLegendSymbol = {
    shape: 'rect';
} & Required<RectLegendSymbolOptions>;

export type PreparedLegendSymbol = RectLegendSymbol;

export type PreparedSeries = ChartKitWidgetSeries & {
    color: string;
    name: string;
    visible: boolean;
    legend: ChartKitWidgetSeries['legend'] & {
        symbol: PreparedLegendSymbol;
    };
};
