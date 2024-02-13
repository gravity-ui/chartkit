import 'highcharts';

import type {StringParams} from './misc';

declare module 'highcharts' {
    interface Axis {
        closestPointRange: number;
    }

    interface Chart {
        afterRedrawCallback: () => void;
        updateParams: (params: StringParams) => void;
        getParams: () => StringParams;
        plotSizeY: number;
        pointsForInitialRefresh: Highcharts.Point[] | Highcharts.Point;
    }

    interface Tooltip {
        fixed: boolean;
        splitTooltip: boolean;
        isHidden: boolean;
        lastVisibleRowIndex: number;
        preFixationHeight?: number;
        getTooltipContainer: Function;
        hideFixedTooltip: Function;
        yagrChart?: {height: number};
    }

    interface PointOptionsObject extends Record<string, string> {
        url?: string;
        params?: Array<string>;
    }

    interface Options extends Record<string, unknown> {
        url?: string;
    }

    interface SeriesOptionsRegistry extends Record<string, Record<string, unknown>> {}

    // for Stock chart from https://github.com/highcharts/highcharts/blob/master/ts/Stock/Navigator/NavigatorComposition.ts#L65
    interface Series {
        // https://github.com/highcharts/highcharts/blob/master/ts/Core/Series/Series.ts#L1023
        getPointsCollection: () => Point[];
        xData: number[];
        baseSeries?: Series;
        navigatorSeries?: Series;
    }

    interface SeriesClickEventObject {
        // https://github.com/highcharts/highcharts/blob/818eb62b9d1a0efc3c9ec705e95b13849e2040fa/ts/Core/Series/Series.ts#L5039
        metaKey?: boolean;
    }
}
