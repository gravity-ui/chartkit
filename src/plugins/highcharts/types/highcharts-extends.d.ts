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
}
