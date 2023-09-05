import {AxisDomain, group, select} from 'd3';
import get from 'lodash/get';
import {dateTime} from '@gravity-ui/date-utils';

import type {
    BaseTextStyle,
    ChartKitWidgetSeries,
    ChartKitWidgetSeriesData,
    ChartKitWidgetAxisType,
    ChartKitWidgetAxisLabels,
    BarXSeries,
} from '../../../../types/widget-data';
import {formatNumber} from '../../../shared';
import type {FormatNumberOptions} from '../../../shared';
import {DEFAULT_AXIS_LABEL_FONT_SIZE} from '../constants';

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
    const groupedSeries = group(series, (item) => item.type);

    return Array.from(groupedSeries).reduce<unknown[]>((acc, [type, seriesList]) => {
        switch (type) {
            case 'bar-x': {
                const barXSeries = seriesList as BarXSeries[];
                const stackedSeries = group(barXSeries, (item) => item.stackId);

                Array.from(stackedSeries).forEach(([, stack]) => {
                    const values: Record<string, number> = {};

                    stack.forEach((singleSeries) => {
                        singleSeries.data.forEach((point) => {
                            const key = String(point.x || point.category);

                            if (typeof values[key] === 'undefined') {
                                values[key] = 0;
                            }

                            if (point.y && typeof point.y === 'number') {
                                values[key] += point.y;
                            }
                        });
                    });

                    acc.push(...Object.values(values));
                });

                break;
            }
            default: {
                seriesList.filter(isSeriesWithNumericalYValues).forEach((s) => {
                    acc.push(...s.data.map((d) => d.y));
                });
            }
        }

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

/**
 * Calculates the height of a text element in a horizontal SVG layout.
 *
 * @param {Object} args - The arguments for the function.
 * @param {string} args.text - The text to be measured.
 * @param {Partial<BaseTextStyle>} args.style - Optional style properties for the text element.
 * @return {number} The height of the text element.
 */
export const getHorisontalSvgTextHeight = (args: {
    text: string;
    style?: Partial<BaseTextStyle>;
}) => {
    const {text, style} = args;
    const textSelection = select(document.body).append('text').text(text);
    const fontSize = get(style, 'fontSize', DEFAULT_AXIS_LABEL_FONT_SIZE);
    let height = 0;

    if (fontSize) {
        textSelection.style('font-size', fontSize);
    }

    textSelection
        .each(function () {
            height = this.getBoundingClientRect().height;
        })
        .remove();

    return height;
};

export const getDataCategoryValue = (args: {
    axisType: 'x' | 'y';
    categories: string[];
    data: ChartKitWidgetSeriesData;
}) => {
    const {axisType, categories, data} = args;

    if ('category' in data && data.category) {
        return data.category;
    }

    if (axisType === 'x') {
        if ('x' in data && typeof data.x === 'string') {
            return data.x;
        }

        if ('x' in data && typeof data.x === 'number') {
            return categories[data.x];
        }
    }

    if (axisType === 'y') {
        if ('y' in data && typeof data.y === 'string') {
            return data.y;
        }

        if ('y' in data && typeof data.y === 'number') {
            return categories[data.y];
        }
    }

    throw new Error('It seems you are trying to get category value from non-categorical data');
};
