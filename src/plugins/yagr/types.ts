import type {RawSerieData, YagrConfig} from 'yagr';

export type {default as Yagr} from 'yagr';
export * from 'yagr/dist/types';

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
