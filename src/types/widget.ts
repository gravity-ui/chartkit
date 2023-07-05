import type {Highcharts, HighchartsWidgetData, StringParams} from '../plugins/highcharts/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';
import type {Yagr, YagrWidgetData} from '../plugins/yagr/types';

export interface ChartKitWidget {
    yagr: {
        data: YagrWidgetData;
        widget: Yagr;
    };
    indicator: {
        data: IndicatorWidgetData;
        widget: never;
        formatNumber?: <T = any>(value: number, options?: T) => string;
    };
    highcharts: {
        data: HighchartsWidgetData;
        widget: Highcharts.Chart | null;
        hoistConfigError?: boolean;
        nonBodyScroll?: boolean;
        splitTooltip?: boolean;
        onChange?: (
            data: {type: 'PARAMS_CHANGED'; data: {params: StringParams}},
            state: {forceUpdate: boolean},
            callExternalOnChange?: boolean,
        ) => void;
    };
}
