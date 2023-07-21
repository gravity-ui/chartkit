import type {MinimalValidConfig, RawSerieData, TooltipOptions, YagrConfig} from '@gravity-ui/yagr';
import type Yagr from '@gravity-ui/yagr';
import {ChartKitProps} from 'src/types';

export type {default as Yagr} from '@gravity-ui/yagr';
export type {YagrReactRef} from '@gravity-ui/yagr/dist/react';
export * from '@gravity-ui/yagr/dist/types';
export interface CustomTooltipProps<T extends Yagr<MinimalValidConfig> = Yagr<MinimalValidConfig>> {
    config?: TooltipOptions;
    yagr: T | undefined;
}

export type YagrWidgetProps = ChartKitProps<'yagr'> & {
    id: string;
    CustomTooltip?: React.ComponentType<CustomTooltipProps>;
};

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
