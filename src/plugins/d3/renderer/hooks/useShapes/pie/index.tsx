import React from 'react';
import get from 'lodash/get';
import {arc, color, curveBasis, pointer, select} from 'd3';
import type {BaseType, Dispatch, PieArcDatum} from 'd3';

import {block} from '../../../../../../utils/cn';

import {PreparedSeriesOptions} from '../../useSeries/types';
import {PieLabelData, PreparedPieData, SegmentData} from './types';
import {PreparedLineData} from '../line/types';
import {setActiveState} from '../utils';
import {line as lineGenerator} from 'd3-shape';
import {setEllipsisForOverflowTexts} from '../../../utils';
import {TooltipDataChunkPie} from '../../../../../../types';

const b = block('d3-pie');

type PreparePieSeriesArgs = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedPieData[];
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
};

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
                if (d.segment.pie.softConnector) {
                    line = line.curve(curveBasis);
                }
                return line(d.connector.points);
            })
            .attr('stroke', (d) => d.connector.color)
            .attr('stroke-width', 1)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            .style('fill', 'none');

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
