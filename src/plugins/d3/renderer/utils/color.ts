import {range, scaleLinear} from 'd3';

import {ChartKitWidgetData} from '../../../../types';

export function getDomainForContinuousColorScale(args: {
    series: ChartKitWidgetData['series']['data'];
}): number[] {
    const {series} = args;
    const values = series.reduce<number[]>((acc, s) => {
        switch (s.type) {
            case 'pie': {
                acc.push(...s.data.map((d) => d.value));
            }
        }

        return acc;
    }, []);

    return [Math.min(...values), Math.max(...values)];
}

export function getContinuesColorFn(args: {values: number[]; colors: string[]; stops?: number[]}) {
    const {values, colors, stops: customStops} = args;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const stops = customStops ?? range(colors.length).map((d, i, list) => d / list.length);
    const color = scaleLinear(stops, colors);

    return (value: number) => {
        const colorValue = (value - min) / (max - min);
        return color(colorValue);
    };
}
