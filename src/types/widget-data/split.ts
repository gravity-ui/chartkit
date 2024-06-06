import type {BaseTextStyle} from './base';

export type PlotOptions = {
    title?: {
        text: string;
        style?: Partial<BaseTextStyle>;
    };
};

export type ChartKitWidgetSplit = {
    enable: boolean;
    layout?: 'vertical';
    gap?: string | number;
    plots?: PlotOptions[];
};
