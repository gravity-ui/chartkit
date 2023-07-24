import React from 'react';

import type {ChartKitWidget} from './widget';
import {ChartKitError} from '../libs';

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
    /** Fires on each chartkit plugin's component render */
    onRender?: (data: ChartKitOnRenderData) => void;
    /** Fires on chartkit plugin's component mount */
    onChartLoad?: (data: ChartKitOnChartLoad<T>) => void;
    /** Fires in case of unhandled plugin's exception */
    onError?: ChartKitOnError;
    /** Used to render user's error component */
    renderError?: RenderError;
    /** Used to render user's plugin loader component */
    renderPluginLoader?: () => React.ReactNode;
} & {
    [key in keyof Omit<ChartKitWidget[T], 'data' | 'widget'>]: ChartKitWidget[T][key];
};

export type ChartKitPlugin = {
    type: ChartKitType;
    renderer: React.LazyExoticComponent<any>;
};

export type RenderErrorOpts = {
    message: string;
    error: ChartKitError | Error;
    resetError: () => void;
};

export type RenderError = (opts: RenderErrorOpts) => React.ReactNode;

export type {ChartKitWidget};
