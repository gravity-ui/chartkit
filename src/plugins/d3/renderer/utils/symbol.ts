import {symbolDiamond2, symbolCircle, symbolSquare, symbolTriangle2} from 'd3';

import {SymbolType} from '../../../../constants';

export const getSymbolType = (index: number) => {
    const scatterStyles = Object.values(SymbolType);

    return scatterStyles[index % scatterStyles.length];
};

// This is an inverted triangle
// Based on https://github.com/d3/d3-shape/blob/main/src/symbol/triangle2.js
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

export const getSymbol = (symbolType: SymbolType) => {
    switch (symbolType) {
        case SymbolType.Diamond:
            return symbolDiamond2;
        case SymbolType.Circle:
            return symbolCircle;
        case SymbolType.Square:
            return symbolSquare;
        case SymbolType.Triangle:
            return symbolTriangle2;
        case SymbolType.TriangleDown:
            return triangleDown;
        default:
            return symbolCircle;
    }
};
