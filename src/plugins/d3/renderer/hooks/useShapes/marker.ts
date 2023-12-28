import {BaseType, Selection, symbol, symbolCircle, symbolSquare} from 'd3';
import {MarkerData as LineMarkerData} from './line/types';
import {MarkerData as AreaMarkerData} from './area/types';
import {block} from '../../../../../utils/cn';

const b = block('d3-marker');
const haloClassName = b('halo');
const symbolClassName = b('symbol');

type MarkerData = LineMarkerData | AreaMarkerData;

export function renderMarker<T extends MarkerData>(
    selection: Selection<BaseType | SVGGElement, T, SVGGElement, unknown>,
) {
    const markerSelection = selection
        .attr('class', b('wrapper'))
        .attr('visibility', getMarkerVisibility)
        .attr('transform', (d) => {
            return `translate(${d.point.x},${d.point.y})`;
        });
    markerSelection
        .append('path')
        .attr('class', haloClassName)
        .attr('d', (d) => {
            const type = d.point.series.marker.states.normal.symbol;
            const radius = d.point.series.marker.states.hover.halo.size;
            return getMarkerSymbol(type, radius);
        })
        .attr('fill', (d) => d.point.series.color)
        .attr('opacity', (d) => d.point.series.marker.states.hover.halo.opacity)
        .attr('z-index', -1)
        .attr('visibility', getMarkerHaloVisibility);
    markerSelection
        .append('path')
        .attr('class', symbolClassName)
        .call(setMarker, 'normal')
        .attr('fill', (d) => d.point.series.color);

    return markerSelection;
}

export function getMarkerVisibility(d: MarkerData) {
    const markerStates = d.point.series.marker.states;
    const enabled = (markerStates.hover.enabled && d.hovered) || markerStates.normal.enabled;
    return enabled ? '' : 'hidden';
}

export function getMarkerHaloVisibility(d: MarkerData) {
    const markerStates = d.point.series.marker.states;
    const enabled = markerStates.hover.halo.enabled && d.hovered;
    return enabled ? '' : 'hidden';
}

export function setMarker<T extends BaseType, D extends MarkerData>(
    selection: Selection<T, D, BaseType | null, unknown>,
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

export function getMarkerSymbol(type: string, radius: number) {
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

export function selectMarkerHalo<T>(parentSelection: Selection<BaseType, T, null, undefined>) {
    return parentSelection.select(`.${haloClassName}`);
}

export function selectMarkerSymbol<T>(parentSelection: Selection<BaseType, T, null, undefined>) {
    return parentSelection.select(`.${symbolClassName}`);
}
