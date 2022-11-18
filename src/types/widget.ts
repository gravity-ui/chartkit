import type Yagr from 'yagr';
import type {YagrWidgetData} from '../plugins/yagr/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';
import type {Highcharts, HighchartsWidgetData, StringParams} from '../plugins/highcharts/types';

export interface ChartkitWidget {
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
