import type {ChartKitWidget} from './widget';

export type {ChartKitHolidays} from './misc';

export type ChartKitLang = 'ru' | 'en';

export type ChartKitType = keyof ChartKitWidget;

export type ChartKitRef = {
    reflow: (details?: unknown) => void;
};

export type ChartKitWidgetRef = {
    reflow?: ChartKitRef['reflow'];
};

export type ChartKitOnLoadData<T extends ChartKitType> = {
    widget?: ChartKitWidget[T]['widget'];
    widgetRendering?: number;
};

export type ChartKitOnError = (data: {error: any}) => void;

export type ChartKitProps<T extends ChartKitType> = {
    type: T;
    data: ChartKitWidget[T]['data'];
    id?: string;
    isMobile?: boolean;
    onLoad?: (data?: ChartKitOnLoadData<T>) => void;
    onError?: ChartKitOnError;
} & {[key in keyof Omit<ChartKitWidget[T], 'data' | 'widget'>]: ChartKitWidget[T][key]};

export type ChartKitPlugin = {
    type: ChartKitType;
    renderer: React.LazyExoticComponent<any>;
};

export type {ChartKitWidget};
