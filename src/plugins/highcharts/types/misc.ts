import type {HighchartsComment} from './comments';

export type StringParams = Record<string, string | string[]>;

export type DrillDownConfig = {
    breadcrumbs: string[];
};

export type XAxisItem = Highcharts.Axis & {
    dataMin: number;
    dataMax: number;
    setExtremes: (...args: any[]) => void;
};

export type ExtendedHChart = Highcharts.Chart & {
    userOptions: Highcharts.Options & {
        _internalComments: HighchartsComment[];
        _externalComments: HighchartsComment[];
        _getComments: () => HighchartsComment[];
        _config?: {region?: string};
    };
    xAxis: XAxisItem[];
    navigator?: Highcharts.Options['navigator'];
};
