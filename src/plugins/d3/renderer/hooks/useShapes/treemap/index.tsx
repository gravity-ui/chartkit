import React from 'react';
import {
    color,
    pointer,
    select,
    treemap,
    treemapBinary,
    treemapDice,
    treemapSlice,
    treemapSliceDice,
    treemapSquarify,
} from 'd3';
import type {BaseType, Dispatch, HierarchyRectangularNode} from 'd3';
import get from 'lodash/get';

import {LayoutAlgorithm} from '../../../../../../constants';
import type {TooltipDataChunkTreemap} from '../../../../../../types';
import {setEllipsisForOverflowTexts} from '../../../utils';
import {block} from '../../../../../../utils/cn';

import {PreparedSeriesOptions} from '../../useSeries/types';
import type {PreparedTreemapData, PreparedTreemapSeriesData, TreemapLabelData} from './types';
import {getLabelData} from './utils';

const b = block('d3-treemap');
const DEFAULT_PADDING = 1;

type ShapeProps = {
    dispatcher: Dispatch<object>;
    preparedData: PreparedTreemapData;
    seriesOptions: PreparedSeriesOptions;
    svgContainer: SVGSVGElement | null;
    width: number;
    height: number;
};

export const TreemapSeriesShape = (props: ShapeProps) => {
    const {dispatcher, preparedData, seriesOptions, svgContainer, width, height} = props;
    const ref = React.useRef<SVGGElement>(null);

    React.useEffect(() => {
        if (!ref.current) {
            return () => {};
        }

        const svgElement = select(ref.current);
        svgElement.selectAll('*').remove();
        const {hierarchy, series} = preparedData;
        const treemapInstance = treemap<PreparedTreemapSeriesData>();

        switch (series.layoutAlgorithm) {
            case LayoutAlgorithm.Binary: {
                treemapInstance.tile(treemapBinary);
                break;
            }
            case LayoutAlgorithm.Dice: {
                treemapInstance.tile(treemapDice);
                break;
            }
            case LayoutAlgorithm.Slice: {
                treemapInstance.tile(treemapSlice);
                break;
            }
            case LayoutAlgorithm.SliceDice: {
                treemapInstance.tile(treemapSliceDice);
                break;
            }
            case LayoutAlgorithm.Squarify: {
                treemapInstance.tile(treemapSquarify);
                break;
            }
        }

        const root = treemapInstance.size([width, height]).paddingInner((d) => {
            const levelOptions = series.levels?.find((l) => l.index === d.depth + 1);
            return levelOptions?.padding ?? DEFAULT_PADDING;
        })(hierarchy);

        const leaf = svgElement
            .selectAll('g')
            .data(root.leaves())
            .join('g')
            .attr('transform', (d) => `translate(${d.x0},${d.y0})`);
        const rectSelection = leaf
            .append('rect')
            .attr('id', (d) => d.id || d.name)
            .attr('fill', (d) => {
                if (d.data.color) {
                    return d.data.color;
                }

                const levelOptions = series.levels?.find((l) => l.index === d.depth);
                return levelOptions?.color || series.color;
            })
            .attr('width', (d) => d.x1 - d.x0)
            .attr('height', (d) => d.y1 - d.y0);

        const labelData: TreemapLabelData[] = series.dataLabels?.enabled
            ? getLabelData(leaf.data())
            : [];
        const labelSelection = svgElement
            .selectAll<SVGTextElement, typeof labelData>('tspan')
            .data(labelData)
            .join('text')
            .text((d) => d.text)
            .attr('class', b('label'))
            .attr('x', (d) => d.x)
            .attr('y', (d) => d.y)
            .style('font-size', () => series.dataLabels.style.fontSize)
            .style('font-weight', () => series.dataLabels.style?.fontWeight || null)
            .style('fill', () => series.dataLabels.style?.fontColor || null)
            .call(setEllipsisForOverflowTexts, (d) => d.width);

        const eventName = `hover-shape.pie`;
        const hoverOptions = get(seriesOptions, 'treemap.states.hover');
        const inactiveOptions = get(seriesOptions, 'treemap.states.inactive');
        svgElement
            .on('mousemove', (e) => {
                const hoveredRect = select<
                    BaseType,
                    HierarchyRectangularNode<PreparedTreemapSeriesData>
                >(e.target);
                const datum = hoveredRect.datum();
                dispatcher.call(
                    'hover-shape',
                    {},
                    [{data: datum.data, series}],
                    pointer(e, svgContainer),
                );
            })
            .on('mouseleave', () => {
                dispatcher.call('hover-shape', {}, undefined);
            });

        dispatcher.on(eventName, (data?: TooltipDataChunkTreemap[]) => {
            const hoverEnabled = hoverOptions?.enabled;
            const inactiveEnabled = inactiveOptions?.enabled;
            const selectedId = (data?.[0].data as PreparedTreemapSeriesData | undefined)?._nodeId;
            rectSelection.datum((d, index, list) => {
                const currentRect = select<
                    BaseType,
                    HierarchyRectangularNode<PreparedTreemapSeriesData>
                >(list[index]);
                const hovered = Boolean(hoverEnabled && d.data._nodeId === selectedId);
                const inactive = Boolean(inactiveEnabled && selectedId && !hovered);
                currentRect
                    .attr('fill', (currentD) => {
                        const levelOptions = series.levels?.find((l) => l.index === currentD.depth);
                        const initialColor = levelOptions?.color || d.data.color || series.color;
                        if (hovered) {
                            return (
                                color(initialColor)
                                    ?.brighter(hoverOptions?.brightness)
                                    .toString() || initialColor
                            );
                        }
                        return initialColor;
                    })
                    .attr('opacity', () => {
                        if (inactive) {
                            return inactiveOptions?.opacity || null;
                        }
                        return null;
                    });

                return d;
            });
            labelSelection.datum((d, index, list) => {
                const currentLabel = select<BaseType, TreemapLabelData>(list[index]);
                const hovered = Boolean(hoverEnabled && d.id === selectedId);
                const inactive = Boolean(inactiveEnabled && selectedId && !hovered);
                currentLabel.attr('opacity', () => {
                    if (inactive) {
                        return inactiveOptions?.opacity || null;
                    }
                    return null;
                });
                return d;
            });
        });

        return () => {
            dispatcher.on(eventName, null);
        };
    }, [dispatcher, preparedData, seriesOptions, svgContainer, width, height]);

    return <g ref={ref} className={b()} />;
};
