import React from 'react';
import block from 'bem-cn-lite';
import {axisLeft, select} from 'd3';
import type {AxisScale, AxisDomain} from 'd3';

import type {ChartOptions} from './useChartOptions';
import type {ChartScale} from './useScales';
import {formatAxisTickLabel, parseTransformStyle} from './utils';

const b = block('chartkit-d3-axis');

type Props = {
    axises: ChartOptions['yAxis'];
    width: number;
    height: number;
    offsetTop: number;
    scale: ChartScale;
};

export const AxisY = ({axises, width, height, offsetTop, scale}: Props) => {
    return (
        <g
            ref={(node) => {
                if (!node) {
                    return;
                }

                const axis = axises[0];
                const svgElement = select(node);
                svgElement.selectAll('*').remove();
                const yAxisGenerator = axisLeft(scale as AxisScale<AxisDomain>)
                    .tickSize(-width * 1.3)
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

                svgElement.call(yAxisGenerator).attr('class', b());
                svgElement.select('.domain').attr('d', `M0,${height}H0V-${offsetTop}`);
                svgElement.selectAll('.tick text').style('font-size', axis.labels.style.fontSize);
                const transformStyle = svgElement.select('.tick').attr('transform');
                const {y} = parseTransformStyle(transformStyle);

                if (y === height) {
                    svgElement.select('.tick').remove();
                }
            }}
        />
    );
};
