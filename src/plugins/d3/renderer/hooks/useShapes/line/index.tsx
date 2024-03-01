import React from 'react';

import type {BaseType, Dispatch} from 'd3';
import {color, line as lineGenerator, select} from 'd3';
import get from 'lodash/get';

import type {TooltipDataChunkLine} from '../../../../../../types';
import {block} from '../../../../../../utils/cn';
import type {LabelData} from '../../../types';
import {filterOverlappingLabels} from '../../../utils';
import type {PreparedSeriesOptions} from '../../useSeries/types';
import {
    getMarkerHaloVisibility,
    getMarkerVisibility,
    renderMarker,
    selectMarkerHalo,
    selectMarkerSymbol,
    setMarker,
} from '../marker';
import {getLineDashArray, setActiveState} from '../utils';

import type {MarkerData, PointData, PreparedLineData} from './types';

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

        const lineSelection = svgElement
            .selectAll('path')
            .data(preparedData)
            .join('path')
            .attr('d', (d) => line(d.points))
            .attr('fill', 'none')
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', (d) => d.width)
            .attr('stroke-linejoin', (d) => d.linecap)
            .attr('stroke-linecap', (d) => d.linecap)
            .attr('stroke-dasharray', (d) => getLineDashArray(d.dashStyle, d.width))
            .attr('opacity', (d) => d.opacity)
            .attr('cursor', (d) => d.series.cursor);

        let dataLabels = preparedData.reduce((acc, d) => {
            return acc.concat(d.labels);
        }, [] as LabelData[]);

        if (!preparedData[0]?.series.dataLabels.allowOverlap) {
            dataLabels = filterOverlappingLabels(dataLabels);
        }

        const labelsSelection = svgElement
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

        const markers = preparedData.reduce<MarkerData[]>((acc, d) => acc.concat(d.markers), []);
        const markerSelection = svgElement
            .selectAll('marker')
            .data(markers)
            .join('g')
            .call(renderMarker);

        const hoverEnabled = hoverOptions?.enabled;
        const inactiveEnabled = inactiveOptions?.enabled;

        dispatcher.on('hover-shape.line', (data?: TooltipDataChunkLine[]) => {
            const selected = data?.find((d) => d.series.type === 'line');
            const selectedDataItem = selected?.data;
            const selectedSeriesId = selected?.series?.id;

            lineSelection.datum((d, index, list) => {
                const elementSelection = select<BaseType, PreparedLineData>(list[index]);

                const hovered = Boolean(hoverEnabled && d.id === selectedSeriesId);
                if (d.hovered !== hovered) {
                    d.hovered = hovered;
                    elementSelection.attr('stroke', (d) => {
                        const initialColor = d.color || '';
                        if (d.hovered) {
                            return (
                                color(initialColor)
                                    ?.brighter(hoverOptions?.brightness)
                                    .toString() || initialColor
                            );
                        }
                        return initialColor;
                    });
                }

                return setActiveState<PreparedLineData>({
                    element: list[index],
                    state: inactiveOptions,
                    active: Boolean(
                        !inactiveEnabled || !selectedSeriesId || selectedSeriesId === d.id,
                    ),
                    datum: d,
                });
            });

            labelsSelection.datum((d, index, list) => {
                return setActiveState<LabelData>({
                    element: list[index],
                    state: inactiveOptions,
                    active: Boolean(
                        !inactiveEnabled || !selectedSeriesId || selectedSeriesId === d.series.id,
                    ),
                    datum: d,
                });
            });

            markerSelection.datum((d, index, list) => {
                const elementSelection = select<BaseType, MarkerData>(list[index]);

                const hovered = Boolean(hoverEnabled && d.point.data === selectedDataItem);
                if (d.hovered !== hovered) {
                    d.hovered = hovered;
                    elementSelection.attr('visibility', getMarkerVisibility(d));
                    selectMarkerHalo(elementSelection).attr('visibility', getMarkerHaloVisibility);
                    selectMarkerSymbol(elementSelection).call(
                        setMarker,
                        hovered ? 'hover' : 'normal',
                    );
                }

                if (d.point.series.marker.states.normal.enabled) {
                    const isActive = Boolean(
                        !inactiveEnabled ||
                            !selectedSeriesId ||
                            selectedSeriesId === d.point.series.id,
                    );
                    setActiveState<MarkerData>({
                        element: list[index],
                        state: inactiveOptions,
                        active: isActive,
                        datum: d,
                    });
                }
                return d;
            });
        });

        return () => {
            dispatcher.on('hover-shape.line', null);
        };
    }, [dispatcher, preparedData, seriesOptions]);

    return <g ref={ref} className={b()} />;
};
