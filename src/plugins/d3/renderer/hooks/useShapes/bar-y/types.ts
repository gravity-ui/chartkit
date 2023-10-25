import {TooltipDataChunkBarX} from '../../../../../../types';
import {PreparedBarYSeries} from '../../useSeries/types';

export type PreparedBarYData = Omit<TooltipDataChunkBarX, 'series'> & {
    x: number;
    y: number;
    width: number;
    height: number;
    series: PreparedBarYSeries;
};
