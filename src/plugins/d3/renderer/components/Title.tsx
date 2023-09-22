import React from 'react';

import {block} from '../../../../utils/cn';
import type {PreparedTitle} from '../hooks';

const b = block('d3-title');

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
            style={{
                lineHeight: `${height}px`,
                ...style,
            }}
        >
            <tspan>{text}</tspan>
        </text>
    );
};
