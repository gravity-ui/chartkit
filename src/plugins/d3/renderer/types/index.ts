import {BaseTextStyle} from '../../../../types';

export type LabelData = {
    text: string;
    x: number;
    y: number;
    style: BaseTextStyle;
    size: {width: number; height: number};
    textAnchor: 'middle';
    series: {id: string};
};
