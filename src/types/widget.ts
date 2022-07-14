import type Yagr from 'yagr';
import type {YagrWidgetData} from '../plugins/yagr/types';

export interface ChartkitWidget {
    yagr: {
        data: YagrWidgetData;
        widget: Yagr;
    };
}
