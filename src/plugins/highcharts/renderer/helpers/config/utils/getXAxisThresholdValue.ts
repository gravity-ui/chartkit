import type {Highcharts} from '../../../../types';

const VALUES_LIMIT = 1000;

export const getXAxisThresholdValue = (
    graphs: Record<string, any>[],
    operation: 'min' | 'max',
): number | null => {
    const xAxisValues = graphs.reduce((acc: number[], series: Record<string, any>) => {
        const data = series.data || [];

        return [...acc, ...data.map((point: Highcharts.Point) => point.x)];
    }, [] as number[]);
    const fn = operation === 'min' ? Math.min : Math.max;
    let index = 0;
    let limited = xAxisValues.slice(0, VALUES_LIMIT);
    let xAxisValue;

    do {
        if (typeof xAxisValue === 'number') {
            limited.push(xAxisValue);
        }
        xAxisValue = fn(...limited);
        index += 1;
        limited = xAxisValues.slice(index * VALUES_LIMIT, index * VALUES_LIMIT + VALUES_LIMIT);
    } while (limited.length);

    return isFinite(xAxisValue) ? xAxisValue : null;
};
