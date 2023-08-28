import React from 'react';
import {arc, pie, select} from 'd3';
import type {PieArcDatum} from 'd3';

import type {PieSeries} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import {calculateNumericProperty} from '../../utils';
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
        const radiusRelatedToChart = Math.min(boundsWidth, boundsHeight) / 2;
        const radius =
            calculateNumericProperty({value: series[0].radius, base: radiusRelatedToChart}) ??
            radiusRelatedToChart;
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
            .selectAll('*')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('class', b('segment'))
            .attr('fill', (d) => d.data.color || '')
            .style('stroke', (d) => d.data.borderColor)
            .style('stroke-width', (d) => d.data.borderWidth);
    }, [boundsWidth, boundsHeight, series, onSeriesMouseMove, onSeriesMouseLeave, svgContainer]);

    return <g ref={ref} className={b()} transform={`translate(${x}, ${y})`} />;
}
