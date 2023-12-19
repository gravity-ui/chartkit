import type {BaseTextStyle} from '../../../../../types';
import type {PointMarkerHalo} from '../../../../../types/widget-data/marker';

export const DEFAULT_LEGEND_SYMBOL_SIZE = 8;

export const DEFAULT_LEGEND_SYMBOL_PADDING = 5;

export const DEFAULT_DATALABELS_PADDING = 5;

export const DEFAULT_DATALABELS_STYLE: BaseTextStyle = {
    fontSize: '11px',
    fontWeight: 'bold',
    fontColor: 'var(--d3-data-labels)',
};

export const DEFAULT_HALO_OPTIONS: Required<PointMarkerHalo> = {
    enabled: true,
    opacity: 0.25,
    radius: 10,
};
