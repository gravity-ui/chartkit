import {PreparedAxis} from '../hooks';
import {AxisDomain, AxisScale, ScaleBand} from 'd3';

export function getTicksCount({axis, range}: {axis: PreparedAxis; range: number}) {
    let ticksCount: number | undefined;

    if (axis.ticks.pixelInterval) {
        ticksCount = Math.ceil(range / axis.ticks.pixelInterval);
    }

    return ticksCount;
}

export function isBandScale(scale: AxisScale<AxisDomain>): scale is ScaleBand<AxisDomain> {
    return 'bandwidth' in scale && typeof scale.bandwidth === 'function';
}

export function getScaleTicks(scale: AxisScale<AxisDomain>, ticksCount?: number) {
    return 'ticks' in scale && typeof scale.ticks === 'function'
        ? scale.ticks(ticksCount)
        : scale.domain();
}

export function getXAxisOffset() {
    return typeof window !== 'undefined' && window.devicePixelRatio > 1 ? 0 : 0.5;
}

function number(scale: AxisScale<AxisDomain>) {
    return (d: AxisDomain) => Number(scale(d));
}

function center(scale: ScaleBand<AxisDomain>, offset: number) {
    offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
    if (scale.round()) {
        offset = Math.round(offset);
    }
    return (d: AxisDomain) => Number(scale(d)) + offset;
}

export function getXTickPosition({scale, offset}: {scale: AxisScale<AxisDomain>; offset: number}) {
    return isBandScale(scale) ? center(scale.copy(), offset) : number(scale.copy());
}

export function getXAxisItems({
    scale,
    count,
    maxCount,
}: {
    scale: AxisScale<AxisDomain>;
    count?: number;
    maxCount: number;
}) {
    const offset = getXAxisOffset();
    let values = getScaleTicks(scale, count);
    const position = getXTickPosition({scale, offset});

    if (values.length > maxCount) {
        const step = Math.ceil(values.length / maxCount);
        values = values.filter((_: AxisDomain, i: number) => i % step === 0);
    }

    // Remove tick that has the same x coordinate like domain
    if (values.length && position(values[0]) === 0) {
        values = values.slice(1);
    }

    return values;
}

export function getMaxTickCount({axis, width}: {axis: PreparedAxis; width: number}) {
    const minTickWidth =
        (width - axis.labels.padding) /
        (parseInt(axis.labels.style.fontSize) + axis.labels.padding);
    return Math.floor(width / minTickWidth);
}
