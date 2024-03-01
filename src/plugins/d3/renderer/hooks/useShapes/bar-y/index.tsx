import React from 'react';
import get from 'lodash/get';
import {color, select} from 'd3';
import type {Dispatch} from 'd3';

import {block} from '../../../../../../utils/cn';
import type {PreparedSeriesOptions} from '../../useSeries/types';
import type {PreparedBarYData} from './types';
export {prepareBarYData} from './prepare-data';

const DEFAULT_LABEL_PADDING = 7;

const b = block('d3-bar-y');

type Args = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedBarYData[];
    seriesOptions: PreparedSeriesOptions;
};

export const BarYSeriesShapes = (args: Args) => {
    const {dispatcher, preparedData, seriesOptions} = args;
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const rectSelection = svgElement
            .selectAll('rect')
            .data(preparedData)
            .join('rect')
            .attr('class', b('segment'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('height', (d) => d.height)
            .attr('width', (d) => d.width)
            .attr('fill', (d) => d.color)
            .attr('opacity', (d) => d.data.opacity || null)
            .attr('cursor', (d) => d.series.cursor);

        const dataLabels = preparedData.filter((d) => d.series.dataLabels.enabled);
        const labelSelection = svgElement
            .selectAll('text')
            .data(dataLabels)
            .join('text')
            .text((d) => String(d.data.label || d.data.x))
            .attr('class', b('label'))
            .attr('x', (d) => {
                if (d.series.dataLabels.inside) {
                    return d.x + d.width / 2;
                }

                return d.x + d.width + DEFAULT_LABEL_PADDING;
            })
            .attr('y', (d) => {
                return d.y + d.height / 2 + d.series.dataLabels.maxHeight / 2;
            })
            .attr('text-anchor', (d) => {
                if (d.series.dataLabels.inside) {
                    return 'middle';
                }

                return 'right';
            })
            .style('font-size', (d) => d.series.dataLabels.style.fontSize)
            .style('font-weight', (d) => d.series.dataLabels.style.fontWeight || null)
            .style('fill', (d) => d.series.dataLabels.style.fontColor || null);

        const hoverOptions = get(seriesOptions, 'bar-y.states.hover');
        const inactiveOptions = get(seriesOptions, 'bar-y.states.inactive');

        dispatcher.on('hover-shape.bar-y', (data?: PreparedBarYData[]) => {
            if (hoverOptions?.enabled) {
                const hovered = data?.reduce((acc, d) => {
                    acc.add(d.data.y);
                    return acc;
                }, new Set());

                rectSelection.attr('fill', (d) => {
                    const fillColor = d.color;

                    if (hovered?.has(d.data.y)) {
                        return (
                            color(fillColor)?.brighter(hoverOptions.brightness).toString() ||
                            fillColor
                        );
                    }

                    return fillColor;
                });
            }

            if (inactiveOptions?.enabled) {
                const hoveredSeries = data?.map((d) => d.series.id);
                const newOpacity = (d: PreparedBarYData) => {
                    if (hoveredSeries?.length && !hoveredSeries.includes(d.series.id)) {
                        return inactiveOptions.opacity || null;
                    }

                    return null;
                };
                rectSelection.attr('opacity', newOpacity);
                labelSelection.attr('opacity', newOpacity);
            }
        });

        return () => {
            dispatcher.on('hover-shape.bar-y', null);
        };
    }, [dispatcher, preparedData, seriesOptions]);

    return <g ref={ref} className={b()} />;
};
