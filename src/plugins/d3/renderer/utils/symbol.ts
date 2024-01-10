import {symbolDiamond2, symbolCircle, symbolSquare, symbolTriangle2} from 'd3';

import {DotStyle} from '../../../../constants';

export const getScatterStyle = (index: number) => {
    const scatterStyles = Object.values(DotStyle);

    return scatterStyles[index % scatterStyles.length];
};

const sqrt3 = Math.sqrt(3);
const triangleDown = {
    draw: (context: CanvasPath, size: number) => {
        const y = -Math.sqrt(size / (sqrt3 * 3));

        context.moveTo(0, -y * 2);
        context.lineTo(-sqrt3 * y, y);
        context.lineTo(sqrt3 * y, y);
        context.closePath();
    },
};

export const getScatterSymbol = (style: string) => {
    switch (style) {
        case DotStyle.Diamond:
            return symbolDiamond2;
        case DotStyle.Circle:
            return symbolCircle;
        case DotStyle.Square:
            return symbolSquare;
        case DotStyle.Triangle:
            return symbolTriangle2;
        case DotStyle.TriangleDown:
            return triangleDown;
        default:
            return symbolCircle;
    }
};
