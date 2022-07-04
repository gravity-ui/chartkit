export interface ChartkitWidget {}

export type ChartKitLang = 'ru' | 'en';

export type ChartkitType = keyof ChartkitWidget;

export type ChartKitRef = {
    reflow: (detail?: unknown) => void;
};

export type ChartKitOnLoadData<T extends ChartkitType> = {
    widget?: ChartkitWidget[T]['widget'];
    widgetRendering?: number;
};

export type ChartKitProps<T extends ChartkitType> = {
    type: T;
    data: ChartkitWidget[T]['data'];
    id?: string;
    onLoad?: (data?: ChartKitOnLoadData<T>) => void;
} & {[key in keyof Omit<ChartkitWidget[T], 'data' | 'widget'>]: ChartkitWidget[T][key]};

export type ChartKitPlugin = {
    type: ChartkitType;
    renderer: React.LazyExoticComponent<any>;
};
