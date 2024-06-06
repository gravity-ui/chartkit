import React from 'react';

import {select} from 'd3';
import type {AxisDomain, AxisScale} from 'd3';

import type {ChartKitWidgetSplit} from '../../../../types';
import {block} from '../../../../utils/cn';
import type {ChartScale, PreparedAxis} from '../hooks';
import {
    calculateNumericProperty,
    formatAxisTickLabel,
    getAxisHeight,
    getClosestPointsRange,
    getMaxTickCount,
    getScaleTicks,
    getTicksCount,
    setEllipsisForOverflowText,
} from '../utils';
import {axisBottom} from '../utils/axis-generators';

const b = block('d3-axis');

type Props = {
    axis: PreparedAxis;
    width: number;
    height: number;
    scale: ChartScale;
    split?: ChartKitWidgetSplit;
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

export const AxisX = React.memo(function AxisX(props: Props) {
    const {axis, width, height: totalHeight, scale, split} = props;
    const ref = React.useRef<SVGGElement | null>(null);
    const plotGap = calculateNumericProperty({value: split?.gap, base: totalHeight}) ?? 0;
    const height = getAxisHeight({split, boundsHeight: totalHeight});

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        let tickItems: [number, number][] = [];
        if (axis.grid.enabled) {
            tickItems = new Array(split?.plots?.length || 1).fill(null).map((_, index) => {
                const top = index * (height + plotGap);
                return [-top, -(top + height)];
            });
        }

        const xAxisGenerator = axisBottom({
            scale: scale as AxisScale<AxisDomain>,
            ticks: {
                items: tickItems,
                labelFormat: getLabelFormatter({axis, scale}),
                labelsPaddings: axis.labels.padding,
                labelsMargin: axis.labels.margin,
                labelsStyle: axis.labels.style,
                labelsMaxWidth: axis.labels.maxWidth,
                labelsLineHeight: axis.labels.lineHeight,
                count: getTicksCount({axis, range: width}),
                maxTickCount: getMaxTickCount({axis, width}),
                rotation: axis.labels.rotation,
            },
            domain: {
                size: width,
                color: axis.lineColor,
            },
        });

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();

        svgElement.call(xAxisGenerator).attr('class', b());

        // add an axis header if necessary
        if (axis.title.text) {
            const y =
                axis.title.height + axis.title.margin + axis.labels.height + axis.labels.margin;

            svgElement
                .append('text')
                .attr('class', b('title'))
                .attr('text-anchor', 'middle')
                .attr('x', width / 2)
                .attr('y', y)
                .attr('font-size', axis.title.style.fontSize)
                .text(axis.title.text)
                .call(setEllipsisForOverflowText, width);
        }
    }, [axis, width, height, scale]);

    return <g ref={ref} />;
});
