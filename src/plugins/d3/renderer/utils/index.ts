import type {AxisDomain} from 'd3';
import {dateTime} from '@gravity-ui/date-utils';

import type {
    ChartKitWidgetSeries,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
} from '../../../../types/widget-data';
import {formatNumber} from '../../../shared';
import type {FormatNumberOptions} from '../../../shared';

export * from './math';

const CHARTS_WITHOUT_AXIS: ChartKitWidgetSeries['type'][] = ['pie'];

type UnknownSeries = {type: ChartKitWidgetSeries['type']; data: unknown};

/**
 * Checks whether the series should be drawn with axes.
 *
 * @param series - The series object to check.
 * @returns `true` if the series should be drawn with axes, `false` otherwise.
 */
export function isAxisRelatedSeries(series: UnknownSeries) {
    return !CHARTS_WITHOUT_AXIS.includes(series.type);
}

export function isSeriesWithNumericalXValues(series: UnknownSeries): series is {
    type: ChartKitWidgetSeries['type'];
    data: {x: number}[];
} {
    return isAxisRelatedSeries(series);
}

export function isSeriesWithNumericalYValues(series: UnknownSeries): series is {
    type: ChartKitWidgetSeries['type'];
    data: {y: number}[];
} {
    return isAxisRelatedSeries(series);
}

export function isSeriesWithCategoryValues(series: UnknownSeries): series is {
    type: ChartKitWidgetSeries['type'];
    data: {category: string}[];
} {
    return isAxisRelatedSeries(series);
}

export const getDomainDataXBySeries = (series: UnknownSeries[]) => {
    return series.reduce<number[]>((acc, s) => {
        if (isSeriesWithNumericalXValues(s)) {
            acc.push(...s.data.map((d) => d.x));
        }

        return acc;
    }, []);
};

export const getDomainDataYBySeries = (series: UnknownSeries[]) => {
    return series.filter(isSeriesWithNumericalYValues).reduce<unknown[]>((acc, s) => {
        acc.push(...s.data.map((d) => d.y));
        return acc;
    }, []);
};

// Uses to get all series names array (except `pie` charts)
export const getSeriesNames = (series: ChartKitWidgetSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        if ('name' in s && typeof s.name === 'string') {
            acc.push(s.name);
        }

        return acc;
    }, []);
};

export const getOnlyVisibleSeries = <T extends {visible: boolean}>(series: T[]) => {
    return series.filter((s) => s.visible);
};

export const parseTransformStyle = (style: string | null): {x?: number; y?: number} => {
    if (!style) {
        return {};
    }

    const stringifiedValue = style.match(/\((.*?)\)/)?.[1] || '';
    const [xString, yString] = stringifiedValue.split(',');
    const x = Number.isNaN(Number(xString)) ? undefined : Number(xString);
    const y = Number.isNaN(Number(yString)) ? undefined : Number(yString);

    return {x, y};
};

const defaultFormatNumberOptions: FormatNumberOptions = {
    precision: 0,
};

export const formatAxisTickLabel = (args: {
    axisType: ChartKitWidgetAxisType;
    value: AxisDomain;
    dateFormat?: ChartKitWidgetAxisLabels['dateFormat'];
    numberFormat?: ChartKitWidgetAxisLabels['numberFormat'];
}) => {
    const {
        axisType,
        value,
        dateFormat = 'DD.MM.YY',
        numberFormat = defaultFormatNumberOptions,
    } = args;

    switch (axisType) {
        case 'category': {
            return value as string;
        }
        case 'datetime': {
            return dateTime({input: value as number | string}).format(dateFormat);
        }
        case 'linear':
        default: {
            return formatNumber(value as number | string, numberFormat);
        }
    }
};
