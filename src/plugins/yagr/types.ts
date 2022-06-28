import type {RawSerieData, YagrConfig} from 'yagr';
import type {ChartKitLang, ChartKitOnLoadData} from '../../types';

export type YagrWidgetData = {
    data: {
        graphs: RawSerieData[];
        timeline: number[];
    };
    libraryConfig: Partial<YagrConfig>;
    sources?: Record<
        number,
        {
            data: {
                program: string;
            };
        }
    >;
};

export type YagrWidgetProps = {
    id: string;
    data: YagrWidgetData;
    lang?: ChartKitLang;
    onLoad?: (data?: ChartKitOnLoadData<'yagr'>) => void;
};
