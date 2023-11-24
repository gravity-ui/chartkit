import React from 'react';
import get from 'lodash/get';
import {arc, color, curveBasis, select} from 'd3';
import type {BaseType, Dispatch, PieArcDatum} from 'd3';

import {block} from '../../../../../../utils/cn';

import {PreparedSeriesOptions} from '../../useSeries/types';
import {PieLabelData, PreparedPieData, SegmentData} from './types';
import {PreparedLineData} from '../line/types';
import {setActiveState} from '../utils';
import {line as lineGenerator} from 'd3-shape';

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
            .join((enter) => {
                const pieData = enter.datum();
                const [x, y] = pieData.center;
                const arcGenerator = arc<PieArcDatum<SegmentData>>()
                    .innerRadius(pieData.innerRadius)
                    .outerRadius(pieData.radius)
                    .cornerRadius(pieData.borderRadius);

                const pieSelection = enter
                    .append('g')
                    .attr('class', b('item'))
                    .attr('transform', `translate(${x}, ${y})`);

                pieSelection
                    .selectAll(segmentSelector)
                    .data(pieData.segments)
                    .join('path')
                    .attr('d', arcGenerator)
                    .attr('class', b('segment'))
                    .attr('fill', (d) => d.data.color)
                    .style('stroke', pieData.borderColor)
                    .style('stroke-width', pieData.borderWidth);

                const labels: PieLabelData[] = pieData.labels;

                pieSelection
                    .selectAll('text')
                    .data(labels)
                    .join('text')
                    .append('tspan')
                    .text((d) => d.text)
                    .attr('class', b('label'))
                    .attr('x', (d) => d.x)
                    .attr('y', (d) => d.y)
                    .attr('text-anchor', (d) => d.textAnchor)
                    .style('font-size', (d) => d.style.fontSize)
                    .style('font-weight', (d) => d.style.fontWeight || null)
                    .style('fill', (d) => d.style.fontColor || null);

                // Add the polylines between chart and labels
                let line = lineGenerator();
                if (pieData.softConnector) {
                    line = line.curve(curveBasis);
                }

                pieSelection
                    .selectAll(connectorSelector)
                    .data(labels)
                    .enter()
                    .append('path')
                    .attr('class', b('connector'))
                    .attr('d', (d) => line(d.connector.points))
                    .attr('stroke', (d) => d.connector.color)
                    .attr('stroke-width', 1)
                    // .attr('points', (d) => d.connector.points.join(' '))
                    .attr('stroke-linejoin', 'round')
                    .attr('stroke-linecap', 'round')
                    .style('fill', 'none');

                return pieSelection;
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

                dispatcher.call('hover-shape', {}, {id: seriesId});
            })
            .on('mouseleave', () => {
                dispatcher.call('hover-shape', {}, undefined);
            });

        dispatcher.on(eventName, (data?: {id: string}) => {
            const selectedSeriesId = data?.id;
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
