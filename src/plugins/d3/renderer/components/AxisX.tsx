import React from 'react';
import block from 'bem-cn-lite';
import {axisBottom, select} from 'd3';
import type {AxisScale, AxisDomain} from 'd3';

import type {ChartOptions} from './useChartOptions';
import type {ChartScale} from './useScales';
import {formatAxisTickLabel, parseTransformStyle} from './utils';

const b = block('chartkit-d3-axis');

type Props = {
    axis: ChartOptions['xAxis'];
    width: number;
    height: number;
    scale: ChartScale;
};

export const AxisX = ({axis, width, height, scale}: Props) => {
    return (
        <g
            ref={(node) => {
                if (!node) {
                    return;
                }

                const svgElement = select(node);
                svgElement.selectAll('*').remove();
                const xAxisGenerator = axisBottom(scale as AxisScale<AxisDomain>)
                    .tickSize(-height * 1.3)
                    .tickPadding(axis.labels.padding)
                    .tickFormat((value) => {
                        return formatAxisTickLabel({
                            axisType: axis.type,
                            value,
                            dateFormat: axis.labels.dateFormat,
                            numberFormat: axis.labels.numberFormat,
                        });
                    })
                    .ticks(6);

                svgElement.call(xAxisGenerator).attr('class', b());
                svgElement.select('.domain').attr('d', `M0,0V0H${width}`);
                svgElement.selectAll('.tick text').style('font-size', axis.labels.style.fontSize);
                const transformStyle = svgElement.select('.tick').attr('transform');
                const {x} = parseTransformStyle(transformStyle);

                if (x === 0) {
                    svgElement.select('.tick').remove();
                }
            }}
        />
    );
};
