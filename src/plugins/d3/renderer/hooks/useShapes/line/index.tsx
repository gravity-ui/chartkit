import React from 'react';
import {select, line as lineGenerator, color} from 'd3';
import type {Dispatch, BaseType, Selection} from 'd3';
import get from 'lodash/get';

import {block} from '../../../../../../utils/cn';
import type {PreparedSeriesOptions} from '../../useSeries/types';
import {PointData, PreparedLineData} from './types';
import {TooltipDataChunkLine} from '../../../../../../types';

const b = block('d3-line');

const EMPTY_SELECTION = null as unknown as Selection<
    BaseType,
    PreparedLineData,
    SVGGElement,
    unknown
>;

const key = (d: unknown) => (d as PreparedLineData).id || -1;

type Args = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedLineData[];
    seriesOptions: PreparedSeriesOptions;
};

export const LineSeriesShapes = (args: Args) => {
    const {dispatcher, preparedData, seriesOptions} = args;

    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'line.states.hover');
        const inactiveOptions = get(seriesOptions, 'line.states.inactive');

        const line = lineGenerator<PointData>()
            .x((d) => d.x)
            .y((d) => d.y);

        const selection = svgElement
            .selectAll('path')
            .data(preparedData)
            .join('path')
            .attr('d', (d) => line(d.points))
            .attr('fill', 'none')
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', (d) => d.width)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round');

        const hoverEnabled = hoverOptions?.enabled;
        const inactiveEnabled = inactiveOptions?.enabled;

        dispatcher.on('hover-shape.line', (data?: TooltipDataChunkLine[]) => {
            const selectedShapeId = data?.[0]?.id;

            const updates: PreparedLineData[] = [];
            preparedData.forEach((p) => {
                const hovered = Boolean(hoverEnabled && p.id === selectedShapeId);
                if (p.hovered !== hovered) {
                    p.hovered = hovered;
                    updates.push(p);
                }

                const active = Boolean(
                    !inactiveEnabled || !selectedShapeId || selectedShapeId === p.id,
                );
                if (p.active !== active) {
                    p.active = active;
                    updates.push(p);
                }
            });

            selection.data(updates, key).join(
                () => EMPTY_SELECTION,
                (update) => {
                    update
                        .attr('stroke', (d) => {
                            const initialColor = d.color || '';
                            if (d.hovered) {
                                return (
                                    color(initialColor)
                                        ?.brighter(hoverOptions?.brightness)
                                        .toString() || initialColor
                                );
                            }
                            return initialColor;
                        })
                        .attr('opacity', function (d) {
                            if (!d.active) {
                                return inactiveOptions?.opacity || null;
                            }

                            return null;
                        });

                    return update;
                },
                (exit) => exit,
            );
        });

        return () => {
            dispatcher.on('hover-shape.line', null);
        };
    }, [dispatcher, preparedData, seriesOptions]);

    return <g ref={ref} className={b()} />;
};
