import type {default as YagrLib, RawSerieData, YagrConfig} from 'yagr';

export type Yagr = YagrLib;

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
