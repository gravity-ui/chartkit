import {TooltipDataChunkBarX} from '../../../../../../types';
import {PreparedBarXSeries} from '../../useSeries/types';
import {LabelData} from '../../../types';

export type PreparedBarXData = Omit<TooltipDataChunkBarX, 'series'> & {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number | null;
    series: PreparedBarXSeries;
    label?: LabelData;
};
