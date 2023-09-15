import {PreparedAxis} from '../hooks';

export function getTicksCount({axis, range}: {axis: PreparedAxis; range: number}) {
    let ticksCount: number | null = null;

    if (axis.ticks.pixelInterval) {
        ticksCount = Math.ceil(range / axis.ticks.pixelInterval);
    }

    return ticksCount;
}
