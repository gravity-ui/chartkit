import type {ChartData} from '@gravity-ui/charts';

import type {SplitLayoutType} from '../components/SplitPane/types';
import type {Highcharts, HighchartsWidgetData, StringParams} from '../plugins/highcharts/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';
import type {CustomTooltipProps, Yagr, YagrWidgetData} from '../plugins/yagr/types';

export interface ChartKitWidget {
    yagr: {
        data: YagrWidgetData;
        widget: Yagr;
        tooltip?: <T extends CustomTooltipProps = CustomTooltipProps>(props: T) => React.ReactNode;
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
        paneSplitOrientation?: SplitLayoutType;
        onSplitPaneOrientationChange?: (orientation: SplitLayoutType) => void;
        onChange?: (
            data: {type: 'PARAMS_CHANGED'; data: {params: StringParams}},
            state: {forceUpdate: boolean},
            callExternalOnChange?: boolean,
        ) => void;
    };
    'gravity-charts': {
        data: ChartData;
        widget: never;
        tooltip?: {
            splitted?: boolean;
        };
    };
}
