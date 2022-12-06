import React from 'react';
import {useThemeType} from '@gravity-ui/uikit';
import {defaults} from 'yagr';
import type {YagrConfig, YagrTheme, MinimalValidConfig} from 'yagr';
import type {YagrChartProps} from 'yagr/dist/react';
import {settings} from '../../../libs';
import type {YagrWidgetData} from '../types';
import {renderTooltip} from './tooltip';
import {getXAxisFormatter} from './utils';

export const useWidgetData = (
    args: YagrWidgetData & {id: string},
): {config: MinimalValidConfig; debug: YagrChartProps['debug']} => {
    const {id, data, sources, libraryConfig} = args;
    const theme = useThemeType() as YagrTheme;
    const config: Partial<YagrConfig> & MinimalValidConfig = React.useMemo(() => {
        const result: Partial<YagrConfig> & MinimalValidConfig = {
            ...libraryConfig,
            timeline: data.timeline,
            series: data.graphs,
        };

        result.chart = {
            appereance: {
                locale: settings.get('lang'),
                theme,
                ...result.chart?.appereance,
            },
            ...result.chart,
        };

        if (result.tooltip?.show !== false) {
            result.tooltip = result.tooltip || {};
            result.tooltip.render = result.tooltip?.render || renderTooltip;
        }

        result.axes = result.axes || {};
        const xAxis = result.axes[defaults.DEFAULT_X_SCALE];

        if (xAxis && !xAxis.values) {
            xAxis.values = getXAxisFormatter(result.chart.timeMultiplier);
        }

        if (!xAxis) {
            result.axes[defaults.DEFAULT_X_SCALE] = {
                values: getXAxisFormatter(result.chart.timeMultiplier),
            };
        }

        return result;
    }, [data, libraryConfig, theme]);
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
