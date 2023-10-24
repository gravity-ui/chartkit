import React from 'react';
import {select, line as lineGenerator, color} from 'd3';
import type {Dispatch} from 'd3';
import get from 'lodash/get';

import {block} from '../../../../../../utils/cn';
import type {PreparedLineSeries, PreparedSeriesOptions} from '../../useSeries/types';
import {PointData, PreparedLineData} from './types';
import {LineSeriesData, TooltipDataChunkLine} from '../../../../../../types';
import {shapeKey} from '../utils';

const b = block('d3-line');

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

        svgElement.selectAll('*').remove();

        const selection = svgElement
            .selectAll('path')
            .data(preparedData, shapeKey)
            .join('path')
            .attr('d', (d) => line(d.points))
            .attr('fill', 'none')
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', (d) => d.width)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round');

        const dataLabels = preparedData.reduce((acc, d) => {
            if (d.series.dataLabels.enabled) {
                acc.push(
                    ...d.points.map((p) => ({
                        x: p.x,
                        y: p.y,
                        data: p.data,
                        series: d.series,
                    })),
                );
            }

            return acc;
        }, [] as {x: number; y: number; data: LineSeriesData; series: PreparedLineSeries}[]);

        svgElement
            .selectAll('allLabels')
            .data(dataLabels)
            .join('text')
            .text((d) => String(d.data.label || d.data.y))
            .attr('class', b('label'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => {
                return d.y - d.series.dataLabels.padding;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', (d) => d.series.dataLabels.style.fontSize)
            .style('font-weight', (d) => d.series.dataLabels.style.fontWeight || null)
            .style('fill', (d) => d.series.dataLabels.style.fontColor || null);

        const hoverEnabled = hoverOptions?.enabled;
        const inactiveEnabled = inactiveOptions?.enabled;

        dispatcher.on('hover-shape.line', (data?: TooltipDataChunkLine[]) => {
            const selectedSeriesId = data?.find((d) => d.series.type === 'line')?.series?.id;

            const updates: PreparedLineData[] = [];
            preparedData.forEach((p) => {
                const hovered = Boolean(hoverEnabled && p.id === selectedSeriesId);
                if (p.hovered !== hovered) {
                    p.hovered = hovered;
                    updates.push(p);
                }

                const active = Boolean(
                    !inactiveEnabled || !selectedSeriesId || selectedSeriesId === p.id,
                );
                if (p.active !== active) {
                    p.active = active;
                    updates.push(p);
                }
            });

            selection.data(updates, shapeKey).join(
                'shape',
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
