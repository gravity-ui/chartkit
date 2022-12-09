import type {RawSerieData, YagrConfig} from '@gravity-ui/yagr';

export type {default as Yagr} from '@gravity-ui/yagr';
export * from '@gravity-ui/yagr/dist/types';

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
