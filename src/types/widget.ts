import type {Yagr, YagrReactRef, YagrWidgetData} from '../plugins/yagr/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';
import type {Highcharts, HighchartsWidgetData, StringParams} from '../plugins/highcharts/types';

export interface ChartKitWidget {
    yagr: {
        data: YagrWidgetData;
        widget: Yagr;
        pluginRef: React.MutableRefObject<YagrReactRef | null>;
    };
    indicator: {
        data: IndicatorWidgetData;
        widget: never;
        pluginRef: never;
        formatNumber?: <T = any>(value: number, options?: T) => string;
    };
    highcharts: {
        data: HighchartsWidgetData;
        widget: Highcharts.Chart | null;
        pluginRef: never;
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
