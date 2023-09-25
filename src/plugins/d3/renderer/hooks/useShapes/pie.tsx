import React from 'react';
import get from 'lodash/get';
import kebabCase from 'lodash/kebabCase';
import {arc, color, pie, pointer, select} from 'd3';
import type {BaseType, Dispatch, PieArcDatum, Selection} from 'd3';

import type {PieSeries, TooltipDataChunkPie} from '../../../../../types/widget-data';
import {block} from '../../../../../utils/cn';

import {
    calculateNumericProperty,
    extractD3DataFromNode,
    getHorisontalSvgTextHeight,
    isNodeContainsD3Data,
} from '../../utils';
import type {NodeWithD3Data} from '../../utils';
import {PreparedPieSeries, PreparedSeriesOptions} from '../useSeries/types';

const b = block('d3-pie');

type PreparePieSeriesArgs = {
    boundsWidth: number;
    boundsHeight: number;
    dispatcher: Dispatch<object>;
    top: number;
    left: number;
    series: PreparedPieSeries[];
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
};

type PreparedPieData = Omit<TooltipDataChunkPie, 'series'> & {
    series: PreparedPieSeries;
};

type PolylineSelection = Selection<
    SVGPolylineElement,
    PieArcDatum<PreparedPieData>,
    SVGGElement,
    unknown
>;

type LabelSelection = Selection<
    BaseType | SVGTextElement,
    PieArcDatum<PreparedPieData>,
    SVGGElement,
    unknown
>;

const preparePieData = (series: PreparedPieSeries[]): PreparedPieData[] => {
    return series.map((s) => ({series: s, data: s.data}));
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
    const resultX = calculateNumericProperty({value: x, base: boundsWidth}) ?? defaultX;
    const resultY = calculateNumericProperty({value: y, base: boundsHeight}) ?? defaultY;

    return [resultX, resultY];
};

const getOpacity = (args: {
    data: PreparedPieData;
    hoveredData?: PreparedPieData;
    opacity?: number;
}) => {
    const {data, hoveredData, opacity} = args;

    if (data.series.innerName !== hoveredData?.series.innerName) {
        return opacity || null;
    }

    return null;
};

const isNodeContainsPieData = (
    node?: Element,
): node is NodeWithD3Data<PieArcDatum<PreparedPieData>> => {
    return isNodeContainsD3Data(node);
};

export function PieSeriesComponent(args: PreparePieSeriesArgs) {
    const {boundsWidth, boundsHeight, dispatcher, top, left, series, seriesOptions, svgContainer} =
        args;
    const ref = React.useRef<SVGGElement>(null);
    const [x, y] = getCenter(boundsWidth, boundsHeight, series[0]?.center);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'pie.states.hover');
        const inactiveOptions = get(seriesOptions, 'pie.states.inactive');
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
        const preparedData = preparePieData(series);
        const pieGenerator = pie<PreparedPieData>().value((d) => d.data.value);
        const visibleData = preparedData.filter((d) => d.series.visible);
        const dataReady = pieGenerator(visibleData);
        const arcGenerator = arc<PieArcDatum<PreparedPieData>>()
            .innerRadius(innerRadius)
            .outerRadius(radius)
            .cornerRadius((d) => d.data.series.borderRadius);
        svgElement.selectAll('*').remove();

        const segmentSelection = svgElement
            .selectAll('segments')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', arcGenerator)
            .attr('class', b('segment'))
            .attr('fill', (d) => d.data.series.color)
            .style('stroke', series[0]?.borderColor || '')
            .style('stroke-width', series[0]?.borderWidth ?? 1);

        let polylineSelection: PolylineSelection | undefined;
        let labelSelection: LabelSelection | undefined;

        if (series[0]?.dataLabels?.enabled) {
            const labelHeight = getHorisontalSvgTextHeight({text: 'tmp'});
            const outerArc = arc<PieArcDatum<PreparedPieData>>()
                .innerRadius(labelsArcRadius)
                .outerRadius(labelsArcRadius);
            const polylineArc = arc<PieArcDatum<PreparedPieData>>()
                .innerRadius(radius)
                .outerRadius(radius);
            // Add the polylines between chart and labels
            polylineSelection = svgElement
                .selectAll('polylines')
                .data(dataReady)
                .enter()
                .append('polyline')
                .attr('stroke', (d) => d.data.series.color || '')
                .attr('stroke-width', 1)
                .attr('points', (d) => {
                    // Line insertion in the slice
                    const posA = polylineArc.centroid(d);
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
                })
                .attr('pointer-events', 'none')
                .style('fill', 'none');

            // Add the polylines between chart and labels
            labelSelection = svgElement
                .selectAll('labels')
                .data(dataReady)
                .join('text')
                .text((d) => d.data.series.label || d.value)
                .attr('class', b('label'))
                .attr('transform', (d) => {
                    const pos = outerArc.centroid(d);
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    pos[0] = radiusRelatedToChart * 0.99 * (midangle < Math.PI ? 1 : -1);
                    pos[1] += labelHeight / 4;
                    return `translate(${pos})`;
                })
                .attr('pointer-events', 'none')
                .style('text-anchor', (d) => {
                    const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
                    return midangle < Math.PI ? 'start' : 'end';
                });
        }

        svgElement
            .on('mousemove', (e) => {
                const segment = e.target;

                if (!isNodeContainsPieData(segment)) {
                    return;
                }

                const [pointerX, pointerY] = pointer(e, svgContainer);
                const segmentData = extractD3DataFromNode(segment).data;
                dispatcher.call(
                    'hover-shape',
                    {},
                    [segmentData],
                    [pointerX - left, pointerY - top],
                );
            })
            .on('mouseleave', () => {
                dispatcher.call('hover-shape', {}, undefined);
            });

        const eventName = `hover-shape.pie-${kebabCase(preparedData[0].series.innerName)}`;
        dispatcher.on(eventName, (datas?: PreparedPieData[]) => {
            const data = datas?.[0];
            const hoverEnabled = hoverOptions?.enabled;
            const inactiveEnabled = inactiveOptions?.enabled;

            if (hoverEnabled && data) {
                segmentSelection.attr('fill', (d) => {
                    const fillColor = d.data.series.color;

                    if (d.data.series.innerName === data.series.innerName) {
                        return (
                            color(fillColor)?.brighter(hoverOptions?.brightness).toString() ||
                            fillColor
                        );
                    }

                    return fillColor;
                });
            } else if (hoverEnabled) {
                segmentSelection.attr('fill', (d) => d.data.series.color);
            }

            if (inactiveEnabled && data) {
                const opacity = inactiveOptions?.opacity;
                segmentSelection.attr('opacity', (d) => {
                    return getOpacity({data: d.data, hoveredData: data, opacity});
                });
                polylineSelection?.attr('opacity', (d) => {
                    return getOpacity({data: d.data, hoveredData: data, opacity});
                });
                labelSelection?.attr('opacity', (d) => {
                    return getOpacity({data: d.data, hoveredData: data, opacity});
                });
            } else if (inactiveEnabled) {
                segmentSelection.attr('opacity', null);
                polylineSelection?.attr('opacity', null);
                labelSelection?.attr('opacity', null);
            }
        });

        return () => {
            dispatcher.on(eventName, null);
        };
    }, [boundsWidth, boundsHeight, dispatcher, top, left, series, seriesOptions, svgContainer]);

    return <g ref={ref} className={b()} transform={`translate(${x}, ${y})`} />;
}
