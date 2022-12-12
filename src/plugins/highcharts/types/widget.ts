import type {Highcharts} from './lib';
import type {HighchartsComment} from './comments';
import type {DrillDownConfig, StringParams} from './misc';

export type CkHighchartsSeriesOptionsType = Highcharts.SeriesOptionsType & {
    title?: string;
    sname?: string;
    fname?: string;
};

export type HighchartsWidgetData = {
    data: (
        | CkHighchartsSeriesOptionsType[]
        | {
              graphs: CkHighchartsSeriesOptionsType[];
              categories_ms: number[];
          }
        | {
              graphs: CkHighchartsSeriesOptionsType[];
              categories: string[];
          }
        | {
              graphs: CkHighchartsSeriesOptionsType[];
          }
    ) & {comments?: HighchartsComment[]};
    config: {
        hideComments?: boolean;
        hideHolidaysBands?: boolean;
        hideHolidays?: boolean;
        hideLegend?: boolean;
        /** @deprecated use `hideLegend` instead */
        showLegend?: boolean;
        /**
         * Percentage value displayed in tooltip.
         * Relevant in case of initialized [stacking](https://api.highcharts.com/highcharts/plotOptions.column.stacking) property only.
         */
        showPercentInTooltip?: boolean;
        disableExternalComments?: boolean;
        normalizeDiv?: boolean;
        normalizeSub?: boolean;
        withoutLineLimit?: boolean;
        precision?: number;
        title?: string;
        subtitle?: string;
        highstock?: {
            override_range_min: number | string;
            override_range_max: number | string;
            range_min?: number | string;
            range_max?: number | string;
        };
        drillDown?: DrillDownConfig;
        enableSum?: boolean;
        unsafe?: boolean;
    };
    libraryConfig: Highcharts.Options;
    params?: StringParams;
    comments?: HighchartsComment[];
    sideMarkdown?: string;
};
