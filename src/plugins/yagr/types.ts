import type {RawSerieData, YagrConfig} from '@gravity-ui/yagr';
import type {YagrReactRef} from '@gravity-ui/yagr/react';

import type {ChartKitProps} from '../../types';

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

export type YagrWidgetData = {
    data: {
        graphs: RawSerieData[];
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
