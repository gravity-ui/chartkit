import React from 'react';
import block from 'bem-cn-lite';

import type {PreparedTitle} from '../hooks';

const b = block('chartkit-d3-title');

type Props = PreparedTitle & {
    chartWidth: number;
};

export const Title = (props: Props) => {
    const {chartWidth, text, height, style} = props;

    return (
        <text
            className={b()}
            dx={chartWidth / 2}
            dy={height / 2}
            dominantBaseline="middle"
            textAnchor="middle"
            style={{fontSize: style?.fontSize, lineHeight: `${height}px`}}
        >
            <tspan>{text}</tspan>
        </text>
    );
};
