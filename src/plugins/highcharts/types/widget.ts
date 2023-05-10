import type {Highcharts} from './lib';
import type {HighchartsComment} from './comments';
import type {DrillDownConfig, StringParams} from './misc';
import type {TooltipData, TooltipLine} from '../renderer/helpers/tooltip/types';

export type CkHighchartsSeriesOptionsType = Highcharts.SeriesOptionsType & {
    title?: string;
    sname?: string;
    fname?: string;
};

export type HighchartsManageTooltipConfigOptions = {
    count: number;
    lines: TooltipLine[];
    shared: boolean;
    this: {
        x: string;
        y: number;
        points: Highcharts.Point[];
    };
    activeRowAlwaysFirstInTooltip?: boolean;
    hiddenRowsNumber?: number;
    hiddenRowsSum?: string;
    splitTooltip?: boolean;
    tooltipHeader?: string;
    unsafe?: boolean;
    useCompareFrom?: boolean;
    withPercent?: boolean;
    xComments?: TooltipData['xComments'];
};

export type HighchartsManageTooltipConfig = (
    options: HighchartsManageTooltipConfigOptions,
    chart: Highcharts.Chart,
) => HighchartsManageTooltipConfigOptions;

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
         *
         * Relevant in case of initialized [stacking](https://api.highcharts.com/highcharts/plotOptions.column.stacking) property only.
         */
        showPercentInTooltip?: boolean;
        disableExternalComments?: boolean;
        normalizeDiv?: boolean;
        normalizeSub?: boolean;
        /**
         * Used to ignore `linesLimit` option
         */
        withoutLineLimit?: boolean;
        precision?: number;
        /**
         * Lines (series) count limit.
         *
         * If you have lines more than `limit`, your chart will throw an error 'ERR.CK.TOO_MANY_LINES'.
         *
         * Ingnored in case of `withoutLineLimit: true`. Default: 50.
         */
        linesLimit?: number;
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
        /**
         * Tooltip config
         */
        tooltip?: {
            pinable?: boolean;
        };
        /**
         * Used to modify tooltip data
         */
        manageTooltipConfig?: HighchartsManageTooltipConfig;
        /**
         * Highcharts series click handler
         */
        onSeriesClick?: (args: {
            event: Highcharts.SeriesClickEventObject;
            series: Highcharts.Series;
        }) => void;
    };
    libraryConfig: Highcharts.Options;
    params?: StringParams;
    comments?: HighchartsComment[];
    sideMarkdown?: string;
};
