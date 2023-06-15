import React from 'react';

import type {ChartKitWidget} from './widget';
import type {ErrorBoundaryRenderErrorView} from '../components/ErrorBoundary/ErrorBoundary';

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

export type ChartKitOnRenderData = {
    renderTime?: number;
};

export type ChartKitOnChartLoad<T extends ChartKitType> = {
    widget?: ChartKitWidget[T]['widget'] | null;
};

export type ChartKitOnError = (data: {error: any}) => void;

export type ChartKitProps<T extends ChartKitType> = {
    type: T;
    data: ChartKitWidget[T]['data'];

    id?: string;
    isMobile?: boolean;
    onLoad?: (data?: ChartKitOnLoadData<T>) => void;
    /**
     * called on each render
     * @param data
     */
    onRender?: (data: ChartKitOnRenderData) => void;
    /**
     * called on chart mount
     * @param data
     */
    onChartLoad?: (data: ChartKitOnChartLoad<T>) => void;
    renderErrorView?: ErrorBoundaryRenderErrorView;
    onError?: ChartKitOnError;
} & {[key in keyof Omit<ChartKitWidget[T], 'data' | 'widget'>]: ChartKitWidget[T][key]};

export type ChartKitPlugin = {
    type: ChartKitType;
    renderer: React.LazyExoticComponent<any>;
};

export type {ChartKitWidget};
