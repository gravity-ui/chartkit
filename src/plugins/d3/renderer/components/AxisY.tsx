import React from 'react';
import block from 'bem-cn-lite';
import {axisLeft, select} from 'd3';
import type {AxisScale, AxisDomain, Selection} from 'd3';

import type {ChartOptions} from './useChartOptions';
import type {ChartScale} from './useScales';
import {formatAxisTickLabel, parseTransformStyle} from './utils';

const b = block('chartkit-d3-axis');
const EMPTY_SPACE_BETWEEN_LABELS = 10;

type Props = {
    axises: ChartOptions['yAxis'];
    width: number;
    height: number;
    offsetTop: number;
    scale: ChartScale;
};

// Note: this method do not prepared for rotated labels
const removeOverlappingYTicks = (axis: Selection<SVGGElement, unknown, null, undefined>) => {
    const a = axis.selectAll('g.tick').nodes();

    if (a.length <= 1) {
        return;
    }

    for (let i = 0, x = 0; i < a.length; i++) {
        const node = a[i] as Element;
        const r = node.getBoundingClientRect();

        if (r.bottom > x && i !== 0) {
            node?.parentNode?.removeChild(node);
        } else {
            x = r.top - EMPTY_SPACE_BETWEEN_LABELS;
        }
    }
};

// FIXME: add overflow ellipsis for the labels that out of boundaries
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
                    // Remove stroke from tick that has the same y coordinate like domain
                    svgElement.select('.tick line').style('stroke', 'none');
                }

                removeOverlappingYTicks(svgElement);
            }}
        />
    );
};
