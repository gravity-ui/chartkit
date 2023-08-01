import type {AxisDomain} from 'd3';
import {dateTime} from '@gravity-ui/date-utils';

import type {
    ChartKitWidgetSeries,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
} from '../../../../types/widget-data';
import {formatNumber} from '../../../shared';
import type {FormatNumberOptions} from '../../../shared';

const CHARTS_WITHOUT_AXIS: ChartKitWidgetSeries['type'][] = ['pie'];

// Сhecks whether the series should be drawn with axes
export const isAxisRelatedSeries = (series: ChartKitWidgetSeries) => {
    return !CHARTS_WITHOUT_AXIS.includes(series.type);
};

export const getDomainDataXBySeries = (series: ChartKitWidgetSeries[]) => {
    return series.filter(isAxisRelatedSeries).reduce<unknown[]>((acc, s) => {
        acc.push(...s.data.map((d) => 'x' in d && d.x));
        return acc;
    }, []);
};

export const getDomainDataYBySeries = (series: ChartKitWidgetSeries[]) => {
    return series.filter(isAxisRelatedSeries).reduce<unknown[]>((acc, s) => {
        acc.push(...s.data.map((d) => 'y' in d && d.y));
        return acc;
    }, []);
};

const extractColor = (styles: CSSStyleDeclaration, token: string) => {
    return styles.getPropertyValue(token).trim();
};

export const extractColorsFromCss = () => {
    const computedStyle = getComputedStyle(document.body);
    const axis = extractColor(computedStyle, '--ck-color-axis');
    const grid = extractColor(computedStyle, '--ck-color-grid');
    const labelAxis = extractColor(computedStyle, '--ck-color-axis-label');

    return {axis, grid, labelAxis};
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

// Uses to get all visible series names array (except `pie` charts)
export const getVisibleSeriesNames = (series: ChartKitWidgetSeries[]) => {
    return series.reduce<string[]>((acc, s) => {
        const visible = s.visible ?? true;

        if ('name' in s && typeof s.name === 'string' && visible) {
            acc.push(s.name);
        }

        return acc;
    }, []);
};

export const getOnlyVisibleSeries = <T extends ChartKitWidgetSeries>(series: T[]) => {
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
    precision: 2,
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
