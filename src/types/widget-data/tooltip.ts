import {TooltipDataChunkType} from '../../constants';

import type {BarXSeries, BarXSeriesData} from './bar-x';
import type {PieSeries, PieSeriesData} from './pie';
import type {ScatterSeries, ScatterSeriesData} from './scatter';

export type TooltipDataChunkBarX<T = any> = {
    type: typeof TooltipDataChunkType.BAR_X;
    data: BarXSeriesData<T>;
    series: BarXSeries<T>;
};

export type TooltipDataChunkPie<T = any> = {
    type: typeof TooltipDataChunkType.PIE;
    data: PieSeriesData<T>;
    series: Omit<PieSeries<T>, 'data'>;
};

export type TooltipDataChunkScatter<T = any> = {
    type: typeof TooltipDataChunkType.SCATTER;
    data: ScatterSeriesData<T>;
    series: ScatterSeries<T>;
};

export type TooltipDataChunk<T = any> =
    | TooltipDataChunkBarX<T>
    | TooltipDataChunkPie<T>
    | TooltipDataChunkScatter<T>;

export type ChartKitWidgetTooltip<T = any> = {
    enabled?: boolean;
    /** Specifies the renderer for the tooltip. If returned null default tooltip renderer will be used. */
    renderer?: (args: {hovered: TooltipDataChunk<T>[]}) => React.ReactElement;
};
