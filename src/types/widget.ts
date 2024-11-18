import type {ChartTooltipContentProps} from '@gravity-ui/charts';

import type {SplitLayoutType} from '../components/SplitPane/types';
import type {Highcharts, HighchartsWidgetData, StringParams} from '../plugins/highcharts/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';
import type {CustomTooltipProps, Yagr, YagrWidgetData} from '../plugins/yagr/types';

import type {ChartKitWidgetData} from './widget-data';

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
    d3: {
        data: ChartKitWidgetData;
        widget: never;
        splitTooltip?: {
            enabled?: boolean;
            initialContent?: Omit<ChartTooltipContentProps, 'renderer'>;
        };
    };
}
