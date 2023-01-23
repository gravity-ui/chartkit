import React from 'react';
import type Highcharts from 'highcharts';
import type YagrChartComponent from '@gravity-ui/yagr/dist/react';

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

export type ChartKitOnRenderData = {
    renderTime?: number;
};

export type ChartKitOnChartLoad = {
    widget?: YagrChartComponent['chart'] | Highcharts.Chart | null;
};

export type ChartKitOnError = (data: {error: any}) => void;

export type ChartKitProps<T extends ChartKitType> = {
    type: T;
    data: ChartKitWidget[T]['data'];
    id?: string;
    isMobile?: boolean;
    /**
     * @depricated: please use onRender & onChartLoad instead
     * @private
     */
    onLoad?: (data?: ChartKitOnLoadData<T>) => void;
    /**
     * called on each render
     * @param data
     */
    onRender?: (data?: ChartKitOnRenderData) => void;
    /**
     * called on mount
     * @param data
     */
    onChartLoad?: (data?: ChartKitOnChartLoad) => void;

    onError?: ChartKitOnError;
} & {[key in keyof Omit<ChartKitWidget[T], 'data' | 'widget'>]: ChartKitWidget[T][key]};

export type ChartKitPlugin = {
    type: ChartKitType;
    renderer: React.LazyExoticComponent<any>;
};

export type {ChartKitWidget};
