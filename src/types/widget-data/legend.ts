import type {BaseTextStyle} from './base';

export type ChartKitWidgetLegend = {
    enabled?: boolean;

    /**
     * The horizontal alignment of the legend box within the chart area.
     *
     * @default center
     * */
    align?: 'left' | 'center' | 'right';

    /**
     * Defines the pixel distance between each legend item
     *
     * @default 20
     * */
    itemDistance?: number;
    /** CSS styles for each legend item */
    itemStyle?: BaseTextStyle;
    /**
     * The space between the legend and the axis labels or chart area.
     *
     * @default 15
     */
    margin?: number;
};

export type BaseLegendSymbol = {
    /**
     * The pixel padding between the legend item symbol and the legend item text.
     *
     * @default 5
     * */
    padding?: number;
};

export type RectLegendSymbolOptions = BaseLegendSymbol & {
    /**
     * The pixel width of the symbol for series types that use a rectangle in the legend
     *
     * @default 10
     * */
    width?: number;

    /**
     * The pixel width of the symbol for series types that use a rectangle in the legend
     *
     * @default 10
     * */
    height?: number;

    /**
     * The border radius of the symbol for series types that use a rectangle in the legend.
     *
     * Defaults to half the symbolHeight, effectively creating a circle.
     */
    radius?: number;
};

export type PathLegendSymbolOptions = BaseLegendSymbol & {
    /**
     * The pixel width of the symbol for series types that use a path in the legend
     *
     * @default 16
     * */
    width?: number;
};
