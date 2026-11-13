import type {FormatNumberOptions} from '../../../shared';
import type {DrillDownConfig, HighchartsWidgetData} from '../../types';

export type ConfigOptions = {
    highcharts: HighchartsWidgetData['libraryConfig'];
    nonBodyScroll?: boolean;
    splitTooltip?: boolean;
    drillDownData?: DrillDownConfig;
    extremes?: {
        min?: number;
        max?: number;
    };
} & HighchartsWidgetData['config'];

export type ChartKitFormatNumberSettings = {
    chartKitFormatting?: boolean;
    chartKitFormat?: FormatNumberOptions['format'];
    chartKitPostfix?: FormatNumberOptions['postfix'];
    chartKitPrecision?: FormatNumberOptions['precision'];
    chartKitPrefix?: FormatNumberOptions['prefix'];
    chartKitShowRankDelimiter?: FormatNumberOptions['showRankDelimiter'];
    chartKitUnit?: FormatNumberOptions['unit'];
    chartKitLabelMode?: FormatNumberOptions['labelMode'];
};
