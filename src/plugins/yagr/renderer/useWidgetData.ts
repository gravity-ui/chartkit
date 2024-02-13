import React from 'react';

import {useThemeValue} from '@gravity-ui/uikit';
import type {YagrChartProps} from '@gravity-ui/yagr/react';

import type {MinimalValidConfig, YagrTheme, YagrWidgetProps} from '../types';

import {shapeYagrConfig} from './utils';

export const useWidgetData = (
    props: YagrWidgetProps,
    id: string,
): {config: MinimalValidConfig; debug: YagrChartProps['debug']} => {
    const {data, sources, libraryConfig} = props.data;
    const theme = useThemeValue() as YagrTheme;
    const config: MinimalValidConfig = React.useMemo(
        () =>
            shapeYagrConfig({
                data,
                libraryConfig,
                theme,
                customTooltip: Boolean(props.tooltip),
            }),
        [data, libraryConfig, theme, props.tooltip],
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
