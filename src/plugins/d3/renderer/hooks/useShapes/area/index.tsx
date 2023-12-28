import React from 'react';
import type {Dispatch, BaseType} from 'd3';
import {color, line as lineGenerator, area as areaGenerator, select} from 'd3';
import get from 'lodash/get';

import {block} from '../../../../../../utils/cn';
import type {PreparedSeriesOptions} from '../../useSeries/types';
import type {MarkerData, PointData, PreparedAreaData} from './types';
import type {TooltipDataChunkArea} from '../../../../../../types';
import type {LabelData} from '../../../types';
import {filterOverlappingLabels} from '../../../utils';
import {setActiveState} from '../utils';
import {
    getMarkerHaloVisibility,
    getMarkerVisibility,
    renderMarker,
    selectMarkerHalo,
    selectMarkerSymbol,
    setMarker,
} from '../marker';

const b = block('d3-area');

type Args = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedAreaData[];
    seriesOptions: PreparedSeriesOptions;
};

export const AreaSeriesShapes = (args: Args) => {
    const {dispatcher, preparedData, seriesOptions} = args;

    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'area.states.hover');
        const inactiveOptions = get(seriesOptions, 'area.states.inactive');

        const line = lineGenerator<PointData>()
            .x((d) => d.x)
            .y((d) => d.y);

        svgElement.selectAll('*').remove();

        const shapeSelection = svgElement
            .selectAll('shape')
            .data(preparedData)
            .join('g')
            .attr('class', b('series'));

        shapeSelection
            .append('path')
            .attr('class', b('line'))
            .attr('d', (d) => line(d.points))
            .attr('fill', 'none')
            .attr('stroke', (d) => d.color)
            .attr('stroke-width', (d) => d.width)
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round');

        const area = areaGenerator<PointData>()
            .x((d) => d.x)
            .y0((d) => d.y0)
            .y1((d) => d.y);
        shapeSelection
            .append('path')
            .attr('class', b('region'))
            .attr('d', (d) => area(d.points))
            .attr('fill', (d) => d.color)
            .attr('opacity', (d) => d.opacity);

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

        dispatcher.on('hover-shape.area', (data?: TooltipDataChunkArea[]) => {
            const selected = data?.find((d) => d.series.type === 'area');
            const selectedDataItem = selected?.data;
            const selectedSeriesId = selected?.series?.id;

            shapeSelection.datum((d, index, list) => {
                const elementSelection = select<BaseType, PreparedAreaData>(list[index]);

                const hovered = Boolean(hoverEnabled && d.id === selectedSeriesId);
                if (d.hovered !== hovered) {
                    d.hovered = hovered;

                    let strokeColor = d.color || '';
                    if (d.hovered) {
                        strokeColor =
                            color(strokeColor)?.brighter(hoverOptions?.brightness).toString() ||
                            strokeColor;
                    }

                    elementSelection.selectAll(`.${b('line')}`).attr('stroke', strokeColor);
                    elementSelection.selectAll(`.${b('region')}`).attr('fill', strokeColor);
                }

                return setActiveState<PreparedAreaData>({
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
            dispatcher.on('hover-shape.area', null);
        };
    }, [dispatcher, preparedData, seriesOptions]);

    return <g ref={ref} className={b()} />;
};
