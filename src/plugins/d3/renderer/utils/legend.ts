import {Selection} from 'd3';

export function createGradientRect(
    container: Selection<SVGGElement, unknown, null, undefined>,
    args: {
        x?: number;
        y?: number;
        width: number;
        height: number;
        interpolator: (value: number) => string;
    },
) {
    const {x = 0, y = 0, width, height, interpolator} = args;

    const n = 256;
    const canvas = document.createElement('canvas');
    canvas.width = n;
    canvas.height = 1;
    const context2 = canvas.getContext('2d');
    for (let i = 0, j = n - 1; i < n; ++i) {
        context2.fillStyle = interpolator(i / j);
        context2.fillRect(i, 0, 1, height);
    }

    return container
        .append('image')
        .attr('preserveAspectRatio', 'none')
        .attr('height', height)
        .attr('width', width)
        .attr('x', x)
        .attr('y', y)
        .attr('xlink:href', canvas.toDataURL());
}
