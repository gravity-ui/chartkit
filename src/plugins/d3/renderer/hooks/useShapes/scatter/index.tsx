import React from 'react';
import get from 'lodash/get';
import {color, pointer, select} from 'd3';
import type {BaseType, Dispatch, Selection} from 'd3';

import {block} from '../../../../../../utils/cn';

import {extractD3DataFromNode, isNodeContainsD3Data} from '../../../utils';
import type {NodeWithD3Data} from '../../../utils';
import {PreparedSeriesOptions} from '../../useSeries/types';
import type {PreparedScatterData} from './prepare-data';

export {prepareScatterData} from './prepare-data';
export type {PreparedScatterData} from './prepare-data';

type ScatterSeriesShapeProps = {
    dispatcher: Dispatch<object>;
    top: number;
    left: number;
    preparedDatas: PreparedScatterData[][];
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
};

type SeriesState = Record<
    string,
    {
        selection: Selection<BaseType, any, SVGGElement, PreparedScatterData>;
        hovered: boolean;
        inactive: boolean;
    }
>;

type ChartState = {
    hoveredSelections: Selection<BaseType, any, SVGGElement, PreparedScatterData>[];
    seriesState: SeriesState;
};

const b = block('d3-scatter');
const DEFAULT_SCATTER_POINT_RADIUS = 4;

const isNodeContainsScatterData = (node?: Element): node is NodeWithD3Data<PreparedScatterData> => {
    return isNodeContainsD3Data(node);
};

export function ScatterSeriesShape(props: ScatterSeriesShapeProps) {
    const {dispatcher, top, left, preparedDatas, seriesOptions, svgContainer} = props;
    const ref = React.useRef<SVGGElement>(null);
    const stateRef = React.useRef<ChartState>({hoveredSelections: [], seriesState: {}});

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'scatter.states.hover');
        const inactiveOptions = get(seriesOptions, 'scatter.states.inactive');
        svgElement.selectAll('*').remove();
        preparedDatas.forEach((preparedData, i) => {
            const selection = svgElement
                .selectAll(`points-${i}`)
                .data(preparedData)
                .join(
                    (enter) => enter.append('circle').attr('class', b('point')),
                    (update) => update,
                    (exit) => exit.remove(),
                )
                .attr('fill', (d) => d.data.color || d.series.color || '')
                .attr('r', (d) => d.data.radius || DEFAULT_SCATTER_POINT_RADIUS)
                .attr('cx', (d) => d.cx)
                .attr('cy', (d) => d.cy);

            stateRef.current.seriesState[preparedData[0].series.innerName] = {
                selection,
                hovered: false,
                inactive: false,
            };
        });

        svgElement
            .on('mousemove', (e) => {
                const point = e.target;

                if (!isNodeContainsScatterData(point)) {
                    return;
                }

                const [pointerX, pointerY] = pointer(e, svgContainer);
                const segmentData = extractD3DataFromNode(point);
                dispatcher.call(
                    'hover-shape',
                    {},
                    [segmentData],
                    [pointerX - left, pointerY - top],
                );
            })
            .on('mouseleave', () => {
                dispatcher.call('hover-shape', {}, undefined);
            });

        dispatcher.on('hover-shape.scatter', (data?: PreparedScatterData[]) => {
            const hoverEnabled = hoverOptions?.enabled;
            const inactiveEnabled = inactiveOptions?.enabled;

            if (hoverEnabled) {
                stateRef.current.hoveredSelections.forEach((selection) => {
                    selection.attr('stroke', null).attr('fill', (d) => d.series.color);
                });
            }

            // check data type
            if (data?.[0]) {
                const className = b('point');
                const points = svgElement.selectAll<BaseType, PreparedScatterData>(
                    `.${className}[cx="${data[0].cx}"][cy="${data[0].cy}"]`,
                );

                if (hoverEnabled) {
                    points
                        // FIXME: replace with marker after supporting such feature
                        .attr('stroke', 'var(--g-color-text-primary)')
                        .attr('fill', (d) => {
                            const fillColor = d.series.color;
                            return (
                                color(fillColor)?.brighter(hoverOptions?.brightness).toString() ||
                                fillColor
                            );
                        });
                }

                stateRef.current.hoveredSelections = [points];

                // Hovered and inactive styles uses only in case of multiple series
                if (Object.keys(stateRef.current.seriesState).length > 1) {
                    const hoveredSeriesName = data[0].series.innerName;

                    Object.entries(stateRef.current.seriesState).forEach(([name, state]) => {
                        if (hoveredSeriesName === name && !state.hovered) {
                            stateRef.current.seriesState[name].hovered = true;
                            stateRef.current.seriesState[name].inactive = false;

                            if (inactiveEnabled) {
                                state.selection.attr('opacity', null);
                            }
                        } else if (hoveredSeriesName !== name) {
                            stateRef.current.seriesState[name].hovered = false;
                            stateRef.current.seriesState[name].inactive = true;

                            if (inactiveEnabled) {
                                state.selection.attr('opacity', inactiveOptions.opacity || null);
                            }
                        }
                    });
                }
            } else if (!data) {
                Object.entries(stateRef.current.seriesState).forEach(([name, state]) => {
                    if (inactiveEnabled) {
                        state.selection.attr('opacity', 1);
                    }

                    stateRef.current.seriesState[name].hovered = false;
                    stateRef.current.seriesState[name].inactive = false;
                });
            }
        });

        return () => {
            dispatcher.on('hover-shape.scatter', null);
        };
    }, [dispatcher, top, left, preparedDatas, seriesOptions, svgContainer]);

    return <g ref={ref} className={b()} />;
}
