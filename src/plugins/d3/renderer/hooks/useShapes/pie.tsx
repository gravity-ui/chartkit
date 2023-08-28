import React from 'react';
import {arc, pie, select} from 'd3';
import type {PieArcDatum} from 'd3';

import type {PieSeries} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import {calculateNumericProperty, getHorisontalSvgTextHeight} from '../../utils';
import type {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';
import {PreparedPieSeries} from '../useSeries/types';

type PreparePieSeriesArgs = {
    boundsWidth: number;
    boundsHeight: number;
    series: PreparedPieSeries[];
    svgContainer: SVGSVGElement | null;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
};

const b = block('d3-pie');

const getCenter = (
    boundsWidth: number,
    boundsHeight: number,
    center?: PieSeries['center'],
): [number, number] => {
    const defaultX = boundsWidth * 0.5;
    const defaultY = boundsHeight * 0.5;

    if (!center) {
        return [defaultX, defaultY];
    }

    const [x, y] = center;
    const resultX = calculateNumericProperty({value: x, base: boundsWidth}) ?? defaultX;
    const resultY = calculateNumericProperty({value: y, base: boundsHeight}) ?? defaultY;

    return [resultX, resultY];
};

export function PieSeriesComponent(args: PreparePieSeriesArgs) {
    const {boundsWidth, boundsHeight, series, onSeriesMouseMove, onSeriesMouseLeave, svgContainer} =
        args;
    const ref = React.useRef<SVGGElement>(null);
    const [x, y] = getCenter(boundsWidth, boundsHeight, series[0]?.center);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        const isLabelsEnabled = series[0]?.dataLabels?.enabled;
        let radiusRelatedToChart = Math.min(boundsWidth, boundsHeight) / 2;

        if (isLabelsEnabled) {
            // To have enough space for labels
            radiusRelatedToChart *= 0.9;
        }

        let radius =
            calculateNumericProperty({value: series[0]?.radius, base: radiusRelatedToChart}) ??
            radiusRelatedToChart;
        const labelsArcRadius = series[0]?.radius ? radius : radiusRelatedToChart;

        if (isLabelsEnabled) {
            // To have enough space for labels lines
            radius *= 0.9;
        }

        const innerRadius =
            calculateNumericProperty({value: series[0].innerRadius, base: radius}) ?? 0;
        const pieGenerator = pie<PreparedPieSeries>().value((d) => d.data);
        const visibleData = series.filter((d) => d.visible);
        const dataReady = pieGenerator(visibleData);
        const arcGenerator = arc<PieArcDatum<PreparedPieSeries>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius((d) => d.data.borderRadius);
        svgElement.selectAll('*').remove();

        svgElement
            .selectAll('allSlices')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('class', b('segment'))
            .attr('fill', (d) => d.data.color || '')
            .style('stroke', series[0]?.borderColor || '')
            .style('stroke-width', series[0]?.borderWidth ?? 1);

        if (series[0]?.dataLabels?.enabled) {
            const labelHeight = getHorisontalSvgTextHeight({text: 'tmp'});
            const outerArc = arc<PieArcDatum<PreparedPieSeries>>()
                .innerRadius(labelsArcRadius)
                .outerRadius(labelsArcRadius);
            // Add the polylines between chart and labels
            svgElement
                .selectAll('allPolylines')
                .data(dataReady)
                .enter()
                .append('polyline')
                .attr('stroke', (d) => d.data.color || '')
                .style('fill', 'none')
                .attr('stroke-width', 1)
                .attr('points', (d) => {
                    // Line insertion in the slice
                    const posA = arcGenerator.centroid(d);
                    // Line break: we use the other arc generator that has been built only for that
                    const posB = outerArc.centroid(d);
                    const posC = outerArc.centroid(d);
                    // We need the angle to see if the X position will be at the extreme right or extreme left
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    const result = [posA, posB, posC];

                    if (midangle < Math.PI) {
                        // polylines located to the right
                        const nextCx = radiusRelatedToChart * 0.95;

                        if (nextCx > result[1][0]) {
                            result[2][0] = nextCx;
                        } else {
                            result.splice(2, 1);
                        }
                    } else {
                        // polylines located to the left
                        const nextCx = radiusRelatedToChart * 0.95 * -1;

                        if (nextCx < result[1][0]) {
                            result[2][0] = nextCx;
                        } else {
                            result.splice(2, 1);
                        }
                    }

                    return result.join(' ');
                });

            // Add the polylines between chart and labels
            svgElement
                .selectAll('allLabels')
                .data(dataReady)
                .join('text')
                .text((d) => d.data.label || d.value)
                .attr('class', b('label'))
                .attr('transform', (d) => {
                    const pos = outerArc.centroid(d);
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    pos[0] = radiusRelatedToChart * 0.99 * (midangle < Math.PI ? 1 : -1);
                    pos[1] += labelHeight / 4;
                    return `translate(${pos})`;
                })
                .style('text-anchor', (d) => {
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    return midangle < Math.PI ? 'start' : 'end';
                });
        }
    }, [boundsWidth, boundsHeight, series, onSeriesMouseMove, onSeriesMouseLeave, svgContainer]);

    return <g ref={ref} className={b()} transform={`translate(${x}, ${y})`} />;
}
