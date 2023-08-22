import React from 'react';
import {arc, pie, select} from 'd3';
import type {PieArcDatum} from 'd3';

import type {PieSeries, PieSeriesData} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import {isStringValueInPercent, isStringValueInPixel} from '../../utils';
import type {OnSeriesMouseLeave, OnSeriesMouseMove} from '../useTooltip/types';

type PreparePieSeriesArgs = {
    boundsWidth: number;
    boundsHeight: number;
    series: PieSeries;
    svgContainer: SVGSVGElement | null;
    onSeriesMouseMove?: OnSeriesMouseMove;
    onSeriesMouseLeave?: OnSeriesMouseLeave;
};

const b = block('d3-pie');
const DEFAULT_INNER_RADIUS = 0;

const getRadius = (radiusRelatedToChart: number, style?: string | number) => {
    if (typeof style === 'undefined') {
        return radiusRelatedToChart;
    }

    if (typeof style === 'string') {
        if (isStringValueInPercent(style)) {
            const percentage = Number.parseFloat(style) / 100;
            return radiusRelatedToChart * percentage;
        }

        if (isStringValueInPixel(style)) {
            return Number.parseFloat(style);
        }

        // In case of incorrect style value
        return radiusRelatedToChart;
    }

    return style;
};

const getInnerRadius = (radius: number, style?: string | number) => {
    if (typeof style === 'undefined') {
        return DEFAULT_INNER_RADIUS;
    }

    if (typeof style === 'string') {
        if (isStringValueInPercent(style)) {
            const percentage = Number.parseFloat(style) / 100;
            return radius * percentage;
        }

        if (isStringValueInPixel(style)) {
            return Number.parseFloat(style);
        }

        // In case of incorrect style value
        return DEFAULT_INNER_RADIUS;
    }

    return style;
};

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
    let resultX: number;
    let resultY: number;

    if (typeof x === 'string') {
        if (isStringValueInPercent(x)) {
            const percentage = Number.parseFloat(x) / 100;
            resultX = boundsWidth * percentage;
        } else if (isStringValueInPixel(x)) {
            resultX = Number.parseFloat(x);
        } else {
            resultX = defaultX;
        }
    } else if (typeof x === 'number') {
        resultX = x;
    } else {
        resultX = defaultX;
    }

    if (typeof y === 'string') {
        if (isStringValueInPercent(y)) {
            const percentage = Number.parseFloat(y) / 100;
            resultY = boundsHeight * percentage;
        } else if (isStringValueInPixel(y)) {
            resultY = Number.parseFloat(y);
        } else {
            resultY = defaultY;
        }
    } else if (typeof y === 'number') {
        resultY = y;
    } else {
        resultY = defaultY;
    }

    return [resultX, resultY];
};

export function PieSeriesComponent(args: PreparePieSeriesArgs) {
    const {boundsWidth, boundsHeight, series, onSeriesMouseMove, onSeriesMouseLeave, svgContainer} =
        args;
    const ref = React.useRef<SVGGElement>(null);
    const [x, y] = getCenter(boundsWidth, boundsHeight, series.center);

    React.useEffect(() => {
        if (!ref.current) {
            return;
        }

        const svgElement = select(ref.current);
        const radiusRelatedToChart = Math.min(boundsWidth, boundsHeight) / 2;
        const radius = getRadius(radiusRelatedToChart, series.radius);
        const innerRadius = getInnerRadius(radius, series.innerRadius);
        const pieGenerator = pie<PieSeriesData>().value((d) => d.value);
        const visibleData = series.data.filter((d) => d.visible);
        const dataReady = pieGenerator(visibleData);
        const arcGenerator = arc<PieArcDatum<PieSeriesData>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius(series.borderRadius ?? 0);
        svgElement.selectAll('*').remove();

        svgElement
            .selectAll('*')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('class', b('segment'))
            .attr('fill', (d) => d.data.color || '')
            .style('stroke', series.borderColor || '')
            .style('stroke-width', series.borderWidth ?? 1);
    }, [boundsWidth, boundsHeight, series, onSeriesMouseMove, onSeriesMouseLeave, svgContainer]);

    return <g ref={ref} className={b()} transform={`translate(${x}, ${y})`} />;
}
