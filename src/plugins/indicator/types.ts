export type IndicatorWidgetDataItem = {
    content: {
        current: {
            value: string | number;
        } & Record<string, unknown>;
    };
    color?: string;
    size?: 's' | 'm' | 'l' | 'xl';
    title?: string;
    nowrap?: boolean;
};

export type IndicatorWidgetData = {
    data?: IndicatorWidgetDataItem[];
    defaultColor?: string;
};
