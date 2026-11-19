import type {RawSerieData, YagrConfig} from '@gravity-ui/yagr';
import type {YagrReactRef} from '@gravity-ui/yagr/react';

import type {ChartKitProps} from '../../types';
import type {FormatNumberOptions} from '../shared';

export type * from '@gravity-ui/yagr';
export type {YagrReactRef} from '@gravity-ui/yagr/react';

// The chart instance type, taken from a named export. @gravity-ui/yagr exposes the class only as
// its default export, and a default import of that CommonJS-typed package from the ESM
// declarations resolves to the module namespace under `moduleResolution: nodenext` (TS2709).
export type Yagr = NonNullable<ReturnType<YagrReactRef['yagr']>>;

export interface CustomTooltipProps {
    yagr: Yagr | undefined;
}

export type YagrWidgetProps = ChartKitProps<'yagr'> & {
    id: string;
};

export interface YagrDataPoint {
    value: number | string | null;
    /**
     * Plain text; null or omitted formats the value, an empty string hides the label.
     */
    label?: string | null;
}

export interface YagrDataLabels {
    /** Show line data labels. Defaults to false. */
    enabled?: boolean;
    /**
     * Number formatting for values without an explicit label.
     * `lang` defaults to the chart locale.
     */
    format?: FormatNumberOptions;
    /**
     * Distance from the point center to the label's bottom edge in CSS pixels. Defaults to 5.
     */
    padding?: number;
    /**
     * Draw labels even when they overlap other labels. Defaults to false.
     */
    allowOverlap?: boolean;
}

export type YagrGraph = RawSerieData & {
    dataLabels?: YagrDataLabels;
    /** Experimental raw data with labels. */
    _data?: YagrDataPoint[];
};

export type YagrWidgetData = {
    data: {
        graphs: YagrGraph[];
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
