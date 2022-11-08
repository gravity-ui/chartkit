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

export type ChartKitOnError = (data: {error: any}) => void;

export type ChartKitFormatNumber = <T = any>(value: number, options?: T) => string;

export type ChartKitProps<T extends ChartkitType> = {
    type: T;
    data: ChartkitWidget[T]['data'];
    id?: string;
    isMobile?: boolean;
    onLoad?: (data?: ChartKitOnLoadData<T>) => void;
    onError?: ChartKitOnError;
    formatNumber?: ChartKitFormatNumber;
} & {[key in keyof Omit<ChartkitWidget[T], 'data' | 'widget'>]: ChartkitWidget[T][key]};

export type ChartKitPlugin = {
    type: ChartkitType;
    renderer: React.LazyExoticComponent<any>;
};

export type {ChartkitWidget};
