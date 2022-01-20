import Yagr from 'yagr';
import type {RawSerieData, YagrConfig} from 'yagr';

export type OnLoadData = {
    widget?: Yagr | null;
    widgetRendering?: number | null;
};

export type YagrWidgetData = {
    data: {
        graphs: RawSerieData[];
        timeline: number[];
    };
    libraryConfig: Partial<YagrConfig>;
    sources: Record<
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
    lang: 'ru' | 'en';
    data: YagrWidgetData;
    onLoad?: (data?: OnLoadData) => void;
};

export type ChartKitProps = {
    id: string;
    type: 'yagr';
    data: YagrWidgetData;
    lang: 'en' | 'ru';
    onLoad?: (data: OnLoadData) => void;
};
