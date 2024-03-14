import type {MinimalValidConfig, RawSerieData, SeriesOptions, YagrConfig} from '@gravity-ui/yagr';
import type Yagr from '@gravity-ui/yagr';

import {ChartKitProps} from 'src/types';

export type {default as Yagr} from '@gravity-ui/yagr';
export type {YagrReactRef} from '@gravity-ui/yagr/react';
export * from '@gravity-ui/yagr/dist/types';

export interface CustomTooltipProps {
    yagr: Yagr<MinimalValidConfig> | undefined;
}

export type YagrWidgetProps = ChartKitProps<'yagr'> & {
    id: string;
};

export type YagrSeriesData<T = Omit<SeriesOptions, 'type'>> = RawSerieData<T> & {
    /**
     * Determines what data value should be used to get a color for tooltip series. Does not work in case of using custom tooltip rendered via `tooltip` property.
     * - `lineColor` indicates that lineColor property should be used
     * - `color` indicates that color property should be used
     *
     * @default 'color'
     */
    legendColorKey?: 'color' | 'lineColor';
};

export type YagrWidgetData = {
    data: {
        graphs: YagrSeriesData[];
        timeline: number[];
        /**
         * Allow to setup timezone for X axis and tooltip's header.
         *
         * Format example: "UTC", "Europe/Moscow".
         *
         * For more examples check [wiki](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)
         */
        timeZone?: string;
    };
    libraryConfig: Partial<YagrConfig>;
    sources?: Record<
        number,
        {
            data: {
                program: string;
            };
        }
    >;
};
