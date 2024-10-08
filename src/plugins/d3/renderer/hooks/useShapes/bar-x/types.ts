import {TooltipDataChunkBarX} from '../../../../../../types';
import {HtmlItem, LabelData} from '../../../types';
import {PreparedBarXSeries} from '../../useSeries/types';

export type PreparedBarXData = Omit<TooltipDataChunkBarX, 'series'> & {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number | null;
    series: PreparedBarXSeries;
    label?: LabelData;
    htmlElements: HtmlItem[];
};
