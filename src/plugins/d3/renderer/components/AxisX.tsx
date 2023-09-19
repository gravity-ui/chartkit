import React from 'react';
import {select} from 'd3';
import type {AxisScale, AxisDomain} from 'd3';

import {block} from '../../../../utils/cn';

import type {ChartScale, PreparedAxis} from '../hooks';
import {
    formatAxisTickLabel,
    getClosestPointsRange,
    setEllipsisForOverflowText,
    getTicksCount,
    getScaleTicks,
    getMaxTickCount,
} from '../utils';
import {axisBottom} from '../utils/axis-generators';

const b = block('d3-axis');

type Props = {
    axis: PreparedAxis;
    width: number;
    height: number;
    scale: ChartScale;
    chartWidth: number;
};

function getLabelFormatter({axis, scale}: {axis: PreparedAxis; scale: ChartScale}) {
    const ticks = getScaleTicks(scale as AxisScale<AxisDomain>);
    const tickStep = getClosestPointsRange(axis, ticks);

    return (value: any) => {
        if (!axis.labels.enabled) {
            return '';
        }

        return formatAxisTickLabel({
            axis,
            value,
            step: tickStep,
        });
    };
}

export const AxisX = React.memo(({axis, width, height, scale, chartWidth}: Props) => {
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();

        const xAxisGenerator = axisBottom({
            scale: scale as AxisScale<AxisDomain>,
            ticks: {
                size: axis.grid.enabled ? height * -1 : 0,
                labelFormat: getLabelFormatter({axis, scale}),
                labelsPaddings: axis.labels.padding,
                labelsMargin: axis.labels.margin,
                labelsStyle: axis.labels.style,
                count: getTicksCount({axis, range: width}),
                maxTickCount: getMaxTickCount({axis, width}),
                autoRotation: axis.labels.autoRotation,
            },
            domain: {
                size: width,
                color: axis.lineColor,
            },
        });

        svgElement.call(xAxisGenerator).attr('class', b());

        if (axis.labels.enabled) {
            svgElement.style('font-size', axis.labels.style.fontSize);
        }

        // add an ellipsis to the labels on the right that go beyond the boundaries of the chart
        svgElement.selectAll('.tick text').each(function () {
            const node = this as unknown as SVGTextElement;
            const textRect = node.getBBox();
            const matrix = node.transform.baseVal.consolidate()?.matrix || ({} as SVGMatrix);
            const right = matrix.a * textRect.right + matrix.c * textRect.bottom + matrix.e;

            if (right > chartWidth) {
                const maxWidth = textRect.width - (right - chartWidth) * 2;
                select(node).call(setEllipsisForOverflowText, maxWidth);
            }
        });

        // add an axis header if necessary
        if (axis.title.text) {
            const textY =
                axis.title.height + parseInt(axis.labels.style.fontSize) + axis.labels.padding;

            svgElement
                .append('text')
                .attr('class', b('title'))
                .attr('text-anchor', 'middle')
                .attr('x', width / 2)
                .attr('y', textY)
                .attr('font-size', axis.title.style.fontSize)
                .text(axis.title.text)
                .call(setEllipsisForOverflowText, width);
        }
    }, [axis, width, height, scale]);

    return <g ref={ref} />;
});
