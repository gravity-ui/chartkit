import type {FormatNumberOptions} from '../../../../shared';
import type {LineShapeType} from './constants';

export type TooltipData = {
    /** Tooltip lines data */
    lines: Array<TooltipLine>;
    /** Tooltip comments */
    xComments?: Array<{
        text: string;
        color: string;
    }>;
    /** Comment text (set via manageTooltipConfig) */
    commentDateText?: string;
    /**
     * Indicating that active line duplicated by displaying it on top of the main list
     * default behavior - the active line is displayed on top of the main list only if it"does not fit" in the tooltip
     */
    activeRowAlwaysFirstInTooltip?: boolean;
    /** Indicating that the chart is displayed in "split tooltip" mode */
    splitTooltip?: boolean;
    /** Text of the header of the tooltip */
    tooltipHeader?: string;
    /** Indicating that a column with the line name is displayed in the tooltip */
    shared?: boolean;
    /** Indicating that a column with a percentage value is displayed in the tooltip */
    withPercent?: boolean;
    /** Indicating that a column with a diff is displayed in the tooltip */
    useCompareFrom?: boolean;
    /** Indicating that the tooltip displays a block with information about the holiday */
    holiday?: boolean;
    /** Name of the holiday */
    holidayText?: string;
    /** Region for which the holiday is relevant */
    region?: string;
    /** Sum of the values of the rows displayed in the tooltip */
    sum?: number | string;
    /** Number of hidden lines "not fit" in the tooltip */
    hiddenRowsNumber: number;
    /** Sum of the values of the hidden ("not fit" in the tooltip) rows */
    hiddenRowsSum?: number | string;
    unsafe?: boolean;
    /** Used to manage tooltip lines sorting */
    sort?: {
        /** Enable tooltip lines sorting. `false` by default */
        enabled?: boolean;
        /** The sort orders. `'desc'` by default */
        order?: 'asc' | 'desc';
        /** The iteratees to sort by key(s) from `TooltipLine`. `'originalValue'` by default */
        iteratee?:
            | keyof TooltipLine
            | keyof TooltipLine[]
            | ((
                  line: TooltipLine,
              ) => TooltipLine[keyof TooltipLine] | TooltipLine[keyof TooltipLine][]);
    };
};

export type TooltipLine = {
    /** Color displayed in a separate cell */
    seriesColor: string;
    /** Series name */
    seriesName: string;
    /** Series index */
    seriesIdx?: number;
    /** Indicating whether the series name should be displayed */
    hideSeriesName?: boolean;
    /** Percentage value displayed in a separate cell */
    percentValue?: number | string;
    /** Diff value displayed in the separate cell */
    diff?: string;
    /** Formatted numeric value for the current series displayed in a separate cell */
    value: string;
    originalValue: number;
    /** Comment to the line (displayed under the corresponding line), set via manageTooltipConfig */
    commentText?: string;
    /** Comment to the line (displayed under the corresponding line) */
    xyCommentText?: string;
    /** Indicating that line is active */
    selectedSeries?: boolean;
    /** Custom renderer of the line (a string with text or html markup) */
    customRender?: string;
    replaceCellAt?: Record<number, (line: TooltipLine) => string>;
    insertCellAt?: Record<number, (line: TooltipLine) => string>;
    /** Line shape displayed in the corresponding cell, instead of seriesColor */
    seriesShape?: LineShapeType;
    chartKitFormatting?: boolean;
    chartKitFormat?: FormatNumberOptions['format'];
    chartKitPostfix?: FormatNumberOptions['postfix'];
    chartKitPrecision?: FormatNumberOptions['precision'];
    chartKitPrefix?: FormatNumberOptions['prefix'];
    chartKitShowRankDelimiter?: FormatNumberOptions['showRankDelimiter'];
    chartKitUnit?: FormatNumberOptions['unit'];
};

export type RowRenderingConfig = {
    cellsRenderers: Array<(line: TooltipLine) => string>;
    isSelectedLine?: boolean;
    allowComment?: boolean;
    withDarkBackground?: boolean;
    isSingleLine?: boolean;
    rowIndex?: number;
};
