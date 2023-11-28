import {
    BarXSeries,
    BarXSeriesData,
    BaseTextStyle,
    ChartKitWidgetLegend,
    PieSeries,
    PieSeriesData,
    RectLegendSymbolOptions,
    ScatterSeries,
    ScatterSeriesData,
    BarYSeries,
    BarYSeriesData,
    LineSeries,
    LineSeriesData,
    ConnectorShape,
    ConnectorCurve,
} from '../../../../../types';
import type {SeriesOptionsDefaults} from '../../constants';

export type RectLegendSymbol = {
    shape: 'rect';
} & Required<RectLegendSymbolOptions>;

export type PreparedLegendSymbol = RectLegendSymbol;

export type PreparedLegend = Required<ChartKitWidgetLegend> & {
    height: number;
    lineHeight: number;
};

export type OnLegendItemClick = (data: {name: string; metaKey: boolean}) => void;

export type LegendItem = {
    color: string;
    name: string;
    symbol: PreparedLegendSymbol;
    textWidth: number;
    visible?: boolean;
};

export type LegendConfig = {
    offset: {
        left: number;
        top: number;
    };
    pagination?: {
        limit: number;
        maxPage: number;
    };
};

type BasePreparedSeries = {
    color: string;
    name: string;
    id: string;
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
    stackId: string;
    dataLabels: {
        enabled: boolean;
        inside: boolean;
        style: BaseTextStyle;
        allowOverlap: boolean;
        padding: number;
    };
} & BasePreparedSeries;

export type PreparedBarYSeries = {
    type: BarYSeries['type'];
    data: BarYSeriesData[];
    stackId: string;
    dataLabels: {
        enabled: boolean;
        inside: boolean;
        style: BaseTextStyle;
        maxHeight: number;
        maxWidth: number;
    };
} & BasePreparedSeries;

export type PreparedPieSeries = {
    type: PieSeries['type'];
    data: PieSeriesData;
    value: PieSeriesData['value'];
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    center?: [string | number | null, string | number | null];
    radius?: string | number;
    innerRadius?: string | number;
    stackId: string;
    label?: PieSeriesData['label'];
    dataLabels: {
        enabled: boolean;
        padding: number;
        style: BaseTextStyle;
        allowOverlap: boolean;
        connectorPadding: number;
        connectorShape: ConnectorShape;
        distance: number;
        connectorCurve: ConnectorCurve;
    };
} & BasePreparedSeries;

export type PreparedLineSeries = {
    type: LineSeries['type'];
    data: LineSeriesData[];
    lineWidth: number;
    dataLabels: {
        enabled: boolean;
        style: BaseTextStyle;
        padding: number;
        allowOverlap: boolean;
    };
} & BasePreparedSeries;

export type PreparedSeries =
    | PreparedScatterSeries
    | PreparedBarXSeries
    | PreparedBarYSeries
    | PreparedPieSeries
    | PreparedLineSeries;

export type PreparedSeriesOptions = SeriesOptionsDefaults;
