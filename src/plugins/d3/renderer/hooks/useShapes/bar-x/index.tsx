import React from 'react';
import get from 'lodash/get';
import {color, select} from 'd3';
import type {Dispatch} from 'd3';

import {block} from '../../../../../../utils/cn';

import type {PreparedSeriesOptions} from '../../useSeries/types';
import type {PreparedBarXData} from './prepare-data';

export {prepareBarXData} from './prepare-data';
export type {PreparedBarXData} from './prepare-data';

const DEFAULT_LABEL_PADDING = 7;

const b = block('d3-bar-x');

type Args = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedBarXData[];
    seriesOptions: PreparedSeriesOptions;
};

export const BarXSeriesShapes = (args: Args) => {
    const {dispatcher, preparedData, seriesOptions} = args;

    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'bar-x.states.hover');
        const inactiveOptions = get(seriesOptions, 'bar-x.states.inactive');
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
            .attr('fill', (d) => d.data.color || d.series.color);

        const dataLabels = preparedData.filter((d) => d.series.dataLabels.enabled);

        const labelSelection = svgElement
            .selectAll('allLabels')
            .data(dataLabels)
            .join('text')
            .text((d) => String(d.data.label || d.data.y))
            .attr('class', b('label'))
            .attr('x', (d) => d.x + d.width / 2)
            .attr('y', (d) => {
                if (d.series.dataLabels.inside) {
                    return d.y + d.height / 2;
                }

                return d.y - DEFAULT_LABEL_PADDING;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', (d) => d.series.dataLabels.style.fontSize)
            .style('font-weight', (d) => d.series.dataLabels.style.fontWeight || null)
            .style('fill', (d) => d.series.dataLabels.style.fontColor || null);

        dispatcher.on('hover-shape.bar-x', (data?: PreparedBarXData[]) => {
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
                        return (
                            color(fillColor)?.brighter(hoverOptions?.brightness).toString() ||
                            fillColor
                        );
                    }

                    return fillColor;
                });
            }

            if (inactiveEnabled) {
                const hoveredSeries = data.map((d) => d.series.innerName);
                rectSelection.attr('opacity', (d) => {
                    return hoveredSeries.includes(d.series.innerName)
                        ? null
                        : inactiveOptions?.opacity || null;
                });
                labelSelection.attr('opacity', (d) => {
                    return hoveredSeries.includes(d.series.innerName)
                        ? null
                        : inactiveOptions?.opacity || null;
                });
            }
        });

        return () => {
            dispatcher.on('hover-shape.bar-x', null);
        };
    }, [dispatcher, preparedData, seriesOptions]);

    return <g ref={ref} className={b()} />;
};
