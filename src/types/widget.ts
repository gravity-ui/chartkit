import type Yagr from 'yagr';
import type {YagrWidgetData} from '../plugins/yagr/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';
import type {Highcharts, HighchartsWidgetData} from '../plugins/highcharts/types';

export interface ChartkitWidget {
    yagr: {
        data: YagrWidgetData;
        widget: Yagr;
    };
    indicator: {
        data: IndicatorWidgetData;
        widget: never;
    };
    highcharts: {
        data: HighchartsWidgetData;
        widget: Highcharts.Chart | null;
    };
}
