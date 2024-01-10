import React from 'react';
import get from 'lodash/get';
import {symbol, color, pointer, select} from 'd3';
import type {BaseType, Dispatch, Selection} from 'd3';

import {block} from '../../../../../../utils/cn';

import {
    extractD3DataFromNode,
    isNodeContainsD3Data,
    getScatterStyle,
    getScatterSymbol,
} from '../../../utils';
import type {NodeWithD3Data} from '../../../utils';
import {PreparedSeriesOptions} from '../../useSeries/types';
import type {PreparedScatterData} from './prepare-data';
import {shapeKey} from '../utils';
import {ScatterSeries} from '../../../../../../types/widget-data';

export {prepareScatterData} from './prepare-data';
export type {PreparedScatterData} from './prepare-data';

type ScatterSeriesShapeProps = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedScatterData[];
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
};

const b = block('d3-scatter');

const DEFAULT_SCATTER_POINT_SIZE = 8;

const EMPTY_SELECTION = null as unknown as Selection<
    BaseType,
    PreparedScatterData,
    SVGGElement,
    unknown
>;

const isNodeContainsScatterData = (node?: Element): node is NodeWithD3Data<PreparedScatterData> => {
    return isNodeContainsD3Data(node);
};

export function ScatterSeriesShape(props: ScatterSeriesShapeProps) {
    const {dispatcher, preparedData, seriesOptions, svgContainer} = props;
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        const hoverOptions = get(seriesOptions, 'scatter.states.hover');
        const inactiveOptions = get(seriesOptions, 'scatter.states.inactive');

        const seriesIds: string[] = [];

        const selection = svgElement
            .selectAll('path')
            .data(preparedData, shapeKey)
            .join(
                (enter) => enter.append('path').attr('class', b('point')),
                (update) => update,
                (exit) => exit.remove(),
            )
            .attr('d', (d) => {
                const seriesId = d.series.id;

                let seriesIdIndex = seriesIds.indexOf(seriesId);
                if (seriesIdIndex === -1) {
                    seriesIds.push(seriesId);
                    seriesIdIndex = seriesIds.length - 1;
                }

                const scatterStyle =
                    (d.series as ScatterSeries).symbol || getScatterStyle(seriesIdIndex);
                const scatterSymbol = getScatterSymbol(scatterStyle);

                const size = d.data.radius ? d.data.radius * 2 : DEFAULT_SCATTER_POINT_SIZE;

                // To cast pixel size to d3 size we need to multiply this value by 6
                return symbol(scatterSymbol, size * 6)();
            })
            .attr('transform', (d) => {
                const size = d.data.radius ? d.data.radius * 2 : DEFAULT_SCATTER_POINT_SIZE;

                // Offset from top left point to center point of symbol shape
                return 'translate(' + (d.cx - size / 2) + ',' + (d.cy - size / 2) + ')';
            })
            .attr('fill', (d) => d.data.color || d.series.color || '');

        svgElement
            .on('mousemove', (e) => {
                const point = e.target;

                if (!isNodeContainsScatterData(point)) {
                    return;
                }

                const [pointerX, pointerY] = pointer(e, svgContainer);
                const segmentData = extractD3DataFromNode(point);
                dispatcher.call('hover-shape', {}, [segmentData], [pointerX, pointerY]);
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

            selection.data(updates, shapeKey).join(
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
    }, [dispatcher, preparedData, seriesOptions, svgContainer]);

    return <g ref={ref} className={b()} />;
}
