import {range, scaleLinear} from 'd3';

export function getDefaultColorStops(size: number) {
    return range(size).map((d) => d / size);
}

export function getContinuesColorFn(args: {values: number[]; colors: string[]; stops?: number[]}) {
    const {values, colors, stops: customStops} = args;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const stops = customStops ?? getDefaultColorStops(colors.length);
    const color = scaleLinear(stops, colors);

    return (value: number) => {
        const colorValue = (value - min) / (max - min);
        return color(colorValue);
    };
}
