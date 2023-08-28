import {
    BarXSeries,
    BarXSeriesData,
    PieSeries,
    PieSeriesData,
    RectLegendSymbolOptions,
    ScatterSeries,
    ScatterSeriesData,
} from '../../../../../types/widget-data';

export type RectLegendSymbol = {
    shape: 'rect';
} & Required<RectLegendSymbolOptions>;

export type PreparedLegendSymbol = RectLegendSymbol;

type BasePreparedSeries = {
    color: string;
    name: string;
    visible: boolean;
    legend: {
        enabled: boolean;
        symbol: PreparedLegendSymbol;
    };
};

export type PreparedScatterSeries = {
    type: ScatterSeries['type'];
    data: ScatterSeriesData[];
} & BasePreparedSeries;

export type PreparedBarXSeries = {
    type: BarXSeries['type'];
    data: BarXSeriesData[];
} & BasePreparedSeries;

export type PreparedPieSeries = BasePreparedSeries &
    Required<
        Pick<
            PieSeries,
            | 'type'
            | 'center'
            | 'radius'
            | 'innerRadius'
            | 'borderColor'
            | 'borderWidth'
            | 'borderRadius'
        >
    > & {
        data: PieSeriesData['value'];
        stackId: string;
    };

export type PreparedSeries = PreparedScatterSeries | PreparedBarXSeries | PreparedPieSeries;
