import type {ChartKitWidgetSeriesOptions} from '../../../../../types';

type DefaultBarXSeriesOptions = Partial<ChartKitWidgetSeriesOptions['bar-x']> & {
    'bar-x': {barMaxWidth: number; barPadding: number; groupPadding: number};
};

export type SeriesOptionsDefaults = Partial<ChartKitWidgetSeriesOptions> & DefaultBarXSeriesOptions;

export const seriesOptionsDefaults: SeriesOptionsDefaults = {
    'bar-x': {
        barMaxWidth: 50,
        barPadding: 0.1,
        groupPadding: 0.2,
        states: {
            hover: {
                enabled: true,
                brightness: 0.3,
            },
            inactive: {
                enabled: true,
                opacity: 0.5,
            },
        },
    },
    pie: {
        states: {
            hover: {
                enabled: true,
                brightness: 0.3,
            },
            inactive: {
                enabled: true,
                opacity: 0.5,
            },
        },
    },
    scatter: {
        states: {
            hover: {
                enabled: true,
                brightness: 0.3,
            },
            inactive: {
                enabled: true,
                opacity: 0.5,
            },
        },
    },
    line: {
        states: {
            hover: {
                enabled: true,
                brightness: 0.3,
            },
            inactive: {
                enabled: true,
                opacity: 0.5,
            },
        },
    },
};
