import type {TooltipHoveredData} from '../../../../../types/widget-data';

export type PointerPosition = [number, number];

export type OnSeriesMouseMove = (args: {
    hovered: TooltipHoveredData;
    pointerPosition?: PointerPosition;
}) => void;

export type OnSeriesMouseLeave = () => void;
