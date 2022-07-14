import type {ChartkitWidget} from './widget';

export type ChartKitLang = 'ru' | 'en';

export type ChartkitType = keyof ChartkitWidget;

export type ChartKitRef = {
    reflow: (details?: unknown) => void;
};

export type ChartKitWidgetRef = {
    reflow?: ChartKitRef['reflow'];
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

export type {ChartkitWidget};
