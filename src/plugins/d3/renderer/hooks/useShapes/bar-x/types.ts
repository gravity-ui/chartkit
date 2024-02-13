import {TooltipDataChunkBarX} from '../../../../../../types';
import {LabelData} from '../../../types';
import {PreparedBarXSeries} from '../../useSeries/types';

export type PreparedBarXData = Omit<TooltipDataChunkBarX, 'series'> & {
    x: number;
    y: number;
    width: number;
    height: number;
    series: PreparedBarXSeries;
    label?: LabelData;
};
