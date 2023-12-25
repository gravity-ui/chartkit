import React from 'react';
import type {Dispatch, Selection, BaseType} from 'd3';
import {color, line as lineGenerator, select, symbol, symbolCircle, symbolSquare} from 'd3';
import get from 'lodash/get';

import {block} from '../../../../../../utils/cn';
import type {PreparedSeriesOptions} from '../../useSeries/types';
import type {MarkerData, PointData, PreparedLineData} from './types';
import type {TooltipDataChunkLine} from '../../../../../../types';
import type {LabelData} from '../../../types';
import {filterOverlappingLabels} from '../../../utils';
import {getLineDashArray, setActiveState} from '../utils';

const b = block('d3-line');

type Args = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedLineData[];
    seriesOptions: PreparedSeriesOptions;
};

function setMarker<T extends BaseType>(
    selection: Selection<T, MarkerData, BaseType | null, unknown>,
    state: 'normal' | 'hover',
) {
    selection
        .attr('d', (d) => {
            const radius =
                d.point.series.marker.states[state].radius +
                d.point.series.marker.states[state].borderWidth;
            return getMarkerSymbol(d.point.series.marker.states.normal.symbol, radius);
        })
        .attr('stroke-width', (d) => d.point.series.marker.states[state].borderWidth)
        .attr('stroke', (d) => d.point.series.marker.states[state].borderColor);
}

function getMarkerSymbol(type: string, radius: number) {
    switch (type) {
        case 'square': {
            const size = Math.pow(radius, 2) * Math.PI;
            return symbol(symbolSquare, size)();
        }
        case 'circle':
        default: {
            const size = Math.pow(radius, 2) * Math.PI;
            return symbol(symbolCircle, size)();
        }
    }
}

const getMarkerVisibility = (d: MarkerData) => {
    const markerStates = d.point.series.marker.states;
    const enabled = (markerStates.hover.enabled && d.hovered) || markerStates.normal.enabled;
    return enabled ? '' : 'hidden';
};

const getMarkerHaloVisibility = (d: MarkerData) => {
    const markerStates = d.point.series.marker.states;
    const enabled = markerStates.hover.halo.enabled && d.hovered;
    return enabled ? '' : 'hidden';
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
            .attr('stroke-dasharray', (d) => getLineDashArray(d.dashStyle, d.width));

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
            .attr('class', b('marker'))
            .attr('visibility', getMarkerVisibility)
            .attr('transform', (d) => {
                return `translate(${d.point.x},${d.point.y})`;
            });
        markerSelection
            .append('path')
            .attr('class', b('marker-halo'))
            .attr('d', (d) => {
                const type = d.point.series.marker.states.normal.symbol;
                const radius = d.point.series.marker.states.hover.halo.radius;
                return getMarkerSymbol(type, radius);
            })
            .attr('fill', (d) => d.point.series.color)
            .attr('opacity', (d) => d.point.series.marker.states.hover.halo.opacity)
            .attr('z-index', -1)
            .attr('visibility', getMarkerHaloVisibility);
        markerSelection
            .append('path')
            .attr('class', b('marker-symbol'))
            .call(setMarker, 'normal')
            .attr('fill', (d) => d.point.series.color);

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
                    elementSelection
                        .select(`.${b('marker-halo')}`)
                        .attr('visibility', getMarkerHaloVisibility);
                    elementSelection
                        .select(`.${b('marker-symbol')}`)
                        .call(setMarker, hovered ? 'hover' : 'normal');
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
