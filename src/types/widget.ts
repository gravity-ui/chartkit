import type Yagr from 'yagr';
import type {YagrWidgetData} from '../plugins/yagr/types';
import type {IndicatorWidgetData} from '../plugins/indicator/types';

export interface ChartkitWidget {
    yagr: {
        data: YagrWidgetData;
        widget: Yagr;
    };
    indicator: {
        data: IndicatorWidgetData;
        widget: never;
    };
}
