import {BaseTextStyle} from '../../../../types';

export type LabelData = {
    text: string;
    x: number;
    y: number;
    style: BaseTextStyle;
    size: {width: number; height: number};
    textAnchor: 'start' | 'end' | 'middle';
    series: {id: string};
    active?: boolean;
};
