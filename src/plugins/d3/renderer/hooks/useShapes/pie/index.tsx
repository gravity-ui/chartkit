import React from 'react';

import {arc, color, line as lineGenerator, pointer, select} from 'd3';
import type {BaseType, Dispatch, PieArcDatum} from 'd3';
import get from 'lodash/get';

import {TooltipDataChunkPie} from '../../../../../../types';
import {block} from '../../../../../../utils/cn';
import {setEllipsisForOverflowTexts} from '../../../utils';
import {PreparedSeriesOptions} from '../../useSeries/types';
import {PreparedLineData} from '../line/types';
import {setActiveState} from '../utils';

import {PieLabelData, PreparedPieData, SegmentData} from './types';
import {getCurveFactory} from './utils';

const b = block('d3-pie');

type PreparePieSeriesArgs = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedPieData[];
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
};

export function getHaloVisibility(d: PieArcDatum<SegmentData>) {
    const enabled = d.data.pie.halo.enabled && d.data.hovered;
    return enabled ? '' : 'hidden';
}

export function PieSeriesShapes(args: PreparePieSeriesArgs) {
    const {dispatcher, preparedData, seriesOptions, svgContainer} = args;
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const segmentSelector = `.${b('segment')}`;
        const connectorSelector = `.${b('connector')}`;

        const shapesSelection = svgElement
            .selectAll('pie')
            .data(preparedData)
            .join('g')
            .attr('id', (pieData) => pieData.id)
            .attr('class', b('item'))
            .attr('transform', (pieData) => {
                const [x, y] = pieData.center;
                return `translate(${x}, ${y})`;
            })
            .style('stroke', (pieData) => pieData.borderColor)
            .style('stroke-width', (pieData) => pieData.borderWidth);

        // Render halo appearing outside the hovered slice
        shapesSelection
            .selectAll('halo')
            .data((pieData) => {
                if (pieData.halo.enabled) {
                    return pieData.segments;
                }
                return [];
            })
            .join('path')
            .attr('d', (d) => {
                const arcGenerator = arc<PieArcDatum<SegmentData>>()
                    .innerRadius(d.data.pie.innerRadius)
                    .outerRadius(d.data.pie.radius + d.data.pie.halo.size)
                    .cornerRadius(d.data.pie.borderRadius);
                return arcGenerator(d);
            })
            .attr('class', b('halo'))
            .attr('fill', (d) => d.data.color)
            .attr('opacity', (d) => d.data.pie.halo.opacity)
            .attr('z-index', -1)
            .attr('visibility', getHaloVisibility);

        // Render segments
        shapesSelection
            .selectAll(segmentSelector)
            .data((pieData) => pieData.segments)
            .join('path')
            .attr('d', (d) => {
                const arcGenerator = arc<PieArcDatum<SegmentData>>()
                    .innerRadius(d.data.pie.innerRadius)
                    .outerRadius(d.data.pie.radius)
                    .cornerRadius(d.data.pie.borderRadius);
                return arcGenerator(d);
            })
            .attr('class', b('segment'))
            .attr('fill', (d) => d.data.color);

        shapesSelection
            .selectAll<SVGTextElement, PieLabelData>('text')
            .data((pieData) => pieData.labels)
            .join('text')
            .text((d) => d.text)
            .attr('class', b('label'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('text-anchor', (d) => d.textAnchor)
            .style('font-size', (d) => d.style.fontSize)
            .style('font-weight', (d) => d.style.fontWeight || null)
            .style('fill', (d) => d.style.fontColor || null)
            .call(setEllipsisForOverflowTexts, (d) =>
                d.size.width > d.maxWidth ? d.maxWidth : Infinity,
            );

        // Add the polyline between chart and labels
        shapesSelection
            .selectAll(connectorSelector)
            .data((pieData) => pieData.labels)
            .enter()
            .append('path')
            .attr('class', b('connector'))
            .attr('d', (d) => {
                let line = lineGenerator();
                const curveFactory = getCurveFactory(d.segment.pie);
                if (curveFactory) {
                    line = line.curve(curveFactory);
                }
                return line(d.connector.points);
            })
            .attr('stroke', (d) => d.connector.color)
            .attr('stroke-width', 1)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .style('fill', 'none');

        // Render custom shapes if defined
        shapesSelection.each(function (d, index, nodes) {
            const customShape = d.series.renderCustomShape?.({
                series: {
                    innerRadius: d.innerRadius,
                },
            });

            if (customShape) {
                (nodes[index] as Element).append(customShape as Node);
            }
        });

        const eventName = `hover-shape.pie`;
        const hoverOptions = get(seriesOptions, 'pie.states.hover');
        const inactiveOptions = get(seriesOptions, 'pie.states.inactive');
        svgElement
            .on('mousemove', (e) => {
                const datum = select<BaseType, PieArcDatum<SegmentData> | PieLabelData>(
                    e.target,
                ).datum();
                const seriesId = get(datum, 'data.series.id', get(datum, 'series.id'));
                const currentSegment = preparedData.reduce<SegmentData | undefined>(
                    (result, pie) => {
                        return (
                            result || pie.segments.find((s) => s.data.series.id === seriesId)?.data
                        );
                    },
                    undefined,
                );

                if (currentSegment) {
                    const data: TooltipDataChunkPie = {
                        series: {
                            id: currentSegment.series.id,
                            type: 'pie',
                            name: currentSegment.series.name,
                        },
                        data: currentSegment.series,
                    };

                    dispatcher.call('hover-shape', {}, [data], pointer(e, svgContainer));
                }
            })
            .on('mouseleave', () => {
                dispatcher.call('hover-shape', {}, undefined);
            });

        dispatcher.on(eventName, (data?: TooltipDataChunkPie[]) => {
            const selectedSeriesId = data?.[0].series.id;
            const hoverEnabled = hoverOptions?.enabled;
            const inactiveEnabled = inactiveOptions?.enabled;

            shapesSelection.datum((_d, index, list) => {
                const pieSelection = select<BaseType, PreparedLineData>(list[index]);
                const haloSelection = pieSelection.selectAll<BaseType, PieArcDatum<SegmentData>>(
                    `.${b('halo')}`,
                );

                pieSelection
                    .selectAll<BaseType, PieArcDatum<SegmentData>>(segmentSelector)
                    .datum((d, i, elements) => {
                        const hovered = Boolean(
                            hoverEnabled && d.data.series.id === selectedSeriesId,
                        );
                        if (d.data.hovered !== hovered) {
                            d.data.hovered = hovered;
                            select(elements[i]).attr('fill', () => {
                                const initialColor = d.data.color;
                                if (d.data.hovered) {
                                    return (
                                        color(initialColor)
                                            ?.brighter(hoverOptions?.brightness)
                                            .toString() || initialColor
                                    );
                                }
                                return initialColor;
                            });

                            const currentSegmentHalo = haloSelection.nodes()[i];
                            select<BaseType, PieArcDatum<SegmentData>>(currentSegmentHalo).attr(
                                'visibility',
                                getHaloVisibility,
                            );
                        }

                        setActiveState<SegmentData>({
                            element: elements[i],
                            state: inactiveOptions,
                            active: Boolean(
                                !inactiveEnabled ||
                                    !selectedSeriesId ||
                                    selectedSeriesId === d.data.series.id,
                            ),
                            datum: d.data,
                        });

                        return d;
                    });
                const labelSelection = pieSelection.selectAll<BaseType, PieLabelData>('tspan');
                const connectorSelection = pieSelection.selectAll<BaseType, PieLabelData>(
                    connectorSelector,
                );
                labelSelection.merge(connectorSelection).datum((d, i, elements) => {
                    return setActiveState<PieLabelData>({
                        element: elements[i],
                        state: inactiveOptions,
                        active: Boolean(
                            !inactiveEnabled ||
                                !selectedSeriesId ||
                                selectedSeriesId === d.series.id,
                        ),
                        datum: d,
                    });
                });
            });
        });

        return () => {
            dispatcher.on(eventName, null);
        };
    }, [dispatcher, preparedData, seriesOptions, svgContainer]);

    return <g ref={ref} className={b()} style={{zIndex: 9}} />;
}
