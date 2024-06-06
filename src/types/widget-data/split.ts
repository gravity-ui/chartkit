type PlotOptions = {
    title?: {text: string};
};

export type ChartKitWidgetSplit = {
    enable: boolean;
    layout?: 'vertical';
    gap?: string | number;
    plots?: PlotOptions[];
};
