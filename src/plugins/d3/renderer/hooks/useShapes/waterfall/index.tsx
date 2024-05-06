import React from 'react';

import {color, line as lineGenerator, select} from 'd3';
import type {Dispatch} from 'd3';
import get from 'lodash/get';

import {DashStyle} from '../../../../../../constants';
import {block} from '../../../../../../utils/cn';
import {LabelData} from '../../../types';
import {filterOverlappingLabels} from '../../../utils';
import type {PreparedSeriesOptions} from '../../useSeries/types';
import {getLineDashArray} from '../utils';

import type {PreparedWaterfallData} from './types';

export {prepareWaterfallData} from './prepare-data';
export * from './types';

const b = block('d3-waterfall');

type Args = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedWaterfallData[];
    seriesOptions: PreparedSeriesOptions;
};

export const WaterfallSeriesShapes = (args: Args) => {
    const {dispatcher, preparedData, seriesOptions} = args;

    const ref = React.useRef<SVGGElement | null>(null);
    const connectorSelector = `.${b('connector')}`;

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'waterfall.states.hover');
        const inactiveOptions = get(seriesOptions, 'waterfall.states.inactive');
        svgElement.selectAll('*').remove();
        const rectSelection = svgElement
            .selectAll('allRects')
            .data(preparedData)
            .join('rect')
            .attr('class', b('segment'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('height', (d) => d.height)
            .attr('width', (d) => d.width)
            .attr('fill', (d) => {
                if (typeof d.data?.color !== 'undefined') {
                    return d.data.color;
                }

                if (d.total) {
                    return d.series.color;
                }

                if (d.data?.y > 0) {
                    return d.series.positiveColor;
                }

                return d.series.negativeColor;
            })
            .attr('opacity', (d) => d.opacity)
            .attr('cursor', (d) => d.series.cursor);

        let dataLabels = preparedData.map((d) => d.label).filter(Boolean) as LabelData[];
        if (!preparedData[0]?.series.dataLabels.allowOverlap) {
            dataLabels = filterOverlappingLabels(dataLabels);
        }

        const labelSelection = svgElement
            .selectAll('text')
            .data(dataLabels)
            .join('text')
            .text((d) => d.text)
            .attr('class', b('label'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .attr('text-anchor', (d) => d.textAnchor)
            .style('font-size', (d) => d.style.fontSize)
            .style('font-weight', (d) => d.style.fontWeight || null)
            .style('fill', (d) => d.style.fontColor || null);

        // Add the connector line between bars
        svgElement
            .selectAll(connectorSelector)
            .data(preparedData)
            .join('path')
            .attr('class', b('connector'))
            .attr('d', (d, index) => {
                const line = lineGenerator();
                let points = [];
                const prev = preparedData[index - 1];
                if (!prev) {
                    return null;
                }

                if (d.data?.y > 0 && !d.total) {
                    points = [
                        prev.data.y > 0 ? [prev.x, prev.y] : [prev.x, prev.y + prev.height],
                        [d.x + d.width, d.y + d.height],
                    ];
                } else {
                    points = [
                        prev.data.y > 0 ? [prev.x, prev.y] : [prev.x, prev.y + prev.height],
                        [d.x + d.width, d.y],
                    ];
                }

                return line(points);
            })
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', () => getLineDashArray(DashStyle.Dash, 1));

        dispatcher.on('hover-shape.waterfall', (data?: PreparedWaterfallData[]) => {
            const hoverEnabled = hoverOptions?.enabled;
            const inactiveEnabled = inactiveOptions?.enabled;

            if (!data) {
                if (hoverEnabled) {
                    rectSelection.attr('fill', (d) => d.data.color || d.series.color);
                }

                if (inactiveEnabled) {
                    rectSelection.attr('opacity', null);
                    labelSelection.attr('opacity', null);
                }

                return;
            }

            if (hoverEnabled) {
                const hoveredValues = data.map((d) => d.data.x);
                rectSelection.attr('fill', (d) => {
                    const fillColor = d.data.color || d.series.color;

                    if (hoveredValues.includes(d.data.x)) {
                        const brightness = hoverOptions?.brightness;
                        return color(fillColor)?.brighter(brightness).toString() || fillColor;
                    }

                    return fillColor;
                });
            }

            if (inactiveEnabled) {
                const hoveredSeries = data.map((d) => d.series.id);
                rectSelection.attr('opacity', (d) => {
                    return hoveredSeries.includes(d.series.id)
                        ? null
                        : inactiveOptions?.opacity || null;
                });
                labelSelection.attr('opacity', (d) => {
                    return hoveredSeries.includes(d.series.id)
                        ? null
                        : inactiveOptions?.opacity || null;
                });
            }
        });

        return () => {
            dispatcher.on('hover-shape.waterfall', null);
        };
    }, [dispatcher, preparedData, seriesOptions]);

    return <g ref={ref} className={b()} />;
};
