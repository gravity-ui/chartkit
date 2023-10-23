import type {BarXSeries, BarXSeriesData} from './bar-x';
import type {PieSeries, PieSeriesData} from './pie';
import type {ScatterSeries, ScatterSeriesData} from './scatter';
import type {LineSeriesData} from './line';

export type TooltipDataChunkBarX<T = any> = {
    data: BarXSeriesData<T>;
    series: BarXSeries<T>;
};

export type TooltipDataChunkPie<T = any> = {
    data: PieSeriesData<T>;
    series: Omit<PieSeries<T>, 'data'>;
};

export type TooltipDataChunkScatter<T = any> = {
    data: ScatterSeriesData<T>;
    series: ScatterSeries<T>;
};

export type TooltipDataChunkLine<T = any> = {
    data: LineSeriesData<T>;
    series: {
        id: string;
    };
};

export type TooltipDataChunk<T = any> =
    | TooltipDataChunkBarX<T>
    | TooltipDataChunkPie<T>
    | TooltipDataChunkScatter<T>
    | TooltipDataChunkLine<T>;

export type ChartKitWidgetTooltip<T = any> = {
    enabled?: boolean;
    /** Specifies the renderer for the tooltip. If returned null default tooltip renderer will be used. */
    renderer?: (args: {hovered: TooltipDataChunk<T>[]}) => React.ReactElement | null;
};
