import {useThemeValue} from '@gravity-ui/uikit';
import type {YagrChartProps} from '@gravity-ui/yagr/dist/react';
import React from 'react';

import type {MinimalValidConfig, YagrTheme, YagrWidgetData} from '../types';

import {shapeYagrConfig} from './utils';

export const useWidgetData = (
    args: YagrWidgetData & {id: string},
): {config: MinimalValidConfig; debug: YagrChartProps['debug']} => {
    const {id, data, sources, libraryConfig} = args;
    const theme = useThemeValue() as YagrTheme;
    const config: MinimalValidConfig = React.useMemo(
        () => shapeYagrConfig({data, libraryConfig, theme}),
        [data, libraryConfig, theme],
    );
    const debug: YagrChartProps['debug'] = React.useMemo(() => {
        const filename = sources
            ? Object.values(sources)
                  .map((source) => {
                      return source?.data?.program;
                  })
                  .filter(Boolean)
                  .join(', ') || id
            : id;
        return {filename};
    }, [id, sources]);

    return {config, debug};
};
