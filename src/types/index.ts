import React from 'react';

import {ChartKitError} from '../libs';
import type {IndicatorWidgetConfig} from '../plugins/indicator/types';

import type {ChartKitWidget} from './widget';

export type {ChartKitHolidays} from './misc';

export type ChartKitLang = 'ru' | 'en';

export type ChartKitType = keyof ChartKitWidget;

export type ChartKitRef = {
    /**
     * Renderers may return a promise that completes when the resized chart is ready.
     * `undefined` means no completion signal is available, including while the widget is loading.
     * It does not guarantee that the chart is ready. Awaiting callers must handle rejection.
     * Gravity Charts also reports preparation failures through onError/renderError;
     * unavailable-host, zero-size and unmount cancellations only reject the promise.
     * For Gravity Charts, pass `{immediate: true}` to skip the resize debounce.
     */
    reflow: (details?: unknown) => void | Promise<void>;
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

export type ChartKitRenderPluginLoader = () => React.ReactNode;

export type ChartKitProps<T extends ChartKitType> = {
    type: T;
    data: ChartKitWidget[T]['data'] | (T extends 'indicator' ? IndicatorWidgetConfig : never);
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
    renderPluginLoader?: ChartKitRenderPluginLoader;
    validation?: {
        /**
         * Series count limit.
         *
         * If you have series more than limit, your chart will throw an error `'ERR.CK.TOO_MANY_LINES'`.
         *
         * - This setting applies only when provided
         * - Supported only for the `gravity-charts` plugin
         */
        seriesCountLimit?: number;
    };
} & {
    [key in keyof Omit<ChartKitWidget[T], 'data' | 'widget'>]: ChartKitWidget[T][key];
};

export type ChartKitPlugin = {
    type: ChartKitType;
    renderer: React.LazyExoticComponent<React.ComponentType<any>>;
};

export type RenderErrorOpts = {
    message: string;
    error: ChartKitError | Error;
    resetError: () => void;
};

export type RenderError = (opts: RenderErrorOpts) => React.ReactNode;

export type {ChartKitWidget};
