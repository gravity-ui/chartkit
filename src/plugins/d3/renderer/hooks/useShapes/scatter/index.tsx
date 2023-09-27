import React from 'react';
import get from 'lodash/get';
import {color, pointer, select} from 'd3';
import type {BaseType, Dispatch, Selection} from 'd3';

import {block} from '../../../../../../utils/cn';

import {extractD3DataFromNode, isNodeContainsD3Data} from '../../../utils';
import type {NodeWithD3Data} from '../../../utils';
import {PreparedSeriesOptions} from '../../useSeries/types';
import type {PreparedScatterData} from './prepare-data';
import cloneDeep from 'lodash/cloneDeep';

export {prepareScatterData} from './prepare-data';
export type {PreparedScatterData} from './prepare-data';

type ScatterSeriesShapeProps = {
    dispatcher: Dispatch<object>;
    top: number;
    left: number;
    preparedDatas: PreparedScatterData[];
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
};

const b = block('d3-scatter');
const DEFAULT_SCATTER_POINT_RADIUS = 4;
const EMPTY_SELECTION = null as unknown as Selection<
    BaseType,
    PreparedScatterData,
    SVGGElement,
    unknown
>;

const key = (d: unknown) => (d as PreparedScatterData).id || -1;

const isNodeContainsScatterData = (node?: Element): node is NodeWithD3Data<PreparedScatterData> => {
    return isNodeContainsD3Data(node);
};

export function ScatterSeriesShape(props: ScatterSeriesShapeProps) {
    const {dispatcher, top, left, preparedDatas, seriesOptions, svgContainer} = props;
    const preparedData = cloneDeep(preparedDatas);
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'scatter.states.hover');
        const inactiveOptions = get(seriesOptions, 'scatter.states.inactive');

        const selection = svgElement
            .selectAll(`circle`)
            .data(preparedData, key)
            .join(
                (enter) => enter.append('circle').attr('class', b('point')),
                (update) => update,
                (exit) => exit.remove(),
            )
            .attr('fill', (d) => d.data.color || d.series.color || '')
            .attr('r', (d) => d.data.radius || DEFAULT_SCATTER_POINT_RADIUS)
            .attr('cx', (d) => d.cx)
            .attr('cy', (d) => d.cy);

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

        const hoverEnabled = hoverOptions?.enabled;
        const inactiveEnabled = inactiveOptions?.enabled;

        dispatcher.on('hover-shape.scatter', (data?: PreparedScatterData[]) => {
            const selectedPoint: PreparedScatterData | undefined = data?.[0];

            const updates: PreparedScatterData[] = [];
            preparedData.forEach((p) => {
                const hovered = Boolean(
                    hoverEnabled &&
                        selectedPoint &&
                        p.cx === selectedPoint.cx &&
                        p.cy === selectedPoint.cy,
                );
                if (p.hovered !== hovered) {
                    p.hovered = hovered;
                    updates.push(p);
                }

                const active = Boolean(
                    !inactiveEnabled || !selectedPoint || selectedPoint.series.id === p.series.id,
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
                        .attr('fill', (d) => {
                            const initialColor = d.data.color || d.series.color || '';
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
            dispatcher.on('hover-shape.scatter', null);
        };
    }, [dispatcher, top, left, preparedDatas, seriesOptions, svgContainer]);

    return <g ref={ref} className={b()} />;
}
