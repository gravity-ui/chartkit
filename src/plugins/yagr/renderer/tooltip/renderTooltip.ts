import {dateTime} from '@gravity-ui/date-utils';

import type {TooltipRow, TooltipRenderOptions, ValueFormatter} from '../../types';
import type {TooltipData, TooltipLine} from './types';
import {formatTooltip} from './tooltip';

const calcOption = <T>(d: T | {[key in string]: T} | undefined) => {
    return typeof d === 'object' && d !== null
        ? Object.values(d).reduce((_, t) => {
              return t;
          })
        : d;
};

/*
 * Default tooltip renderer.
 * Adapter between native Yagr tooltip config and ChartKit
 * tooltip renderer.
 */
export const renderTooltip = (data: TooltipRenderOptions) => {
    const cfg = data.yagr.config;
    const timeMultiplier = cfg.chart.timeMultiplier || 1;
    const opts = data.options;
    const {x, state} = data;

    let sumTotal = 0;
    const rows = Object.values(data.scales).reduce((acc, scale) => {
        sumTotal += scale.sum || 0;
        return acc.concat(scale.rows);
    }, [] as TooltipRow[]);

    const lines = rows.length;
    const sum = calcOption(opts.sum);

    const maxLines = calcOption<number>(opts.maxLines);
    const valueFormatter = calcOption<ValueFormatter>(opts.value);
    // eslint-disable-next-line no-nested-ternary
    const hiddenRowsNumber = state.pinned
        ? undefined
        : lines > maxLines
        ? Math.abs(maxLines - lines)
        : undefined;

    const hiddenRowsSum = hiddenRowsNumber
        ? valueFormatter(
              rows
                  .slice(-hiddenRowsNumber)
                  .reduce((acc, {originalValue}) => acc + (originalValue || 0), 0),
          )
        : undefined;

    const tooltipFormatOptions: TooltipData = {
        activeRowAlwaysFirstInTooltip: rows.length > 1,
        tooltipHeader: dateTime({input: x / timeMultiplier}).format('DD MMMM YYYY HH:mm:ss'),
        shared: true,
        lines: rows.map(
            (row, i) =>
                ({
                    ...row,
                    seriesName: row.name || 'Serie ' + (i + 1),
                    seriesColor: row.color,
                    selectedSeries: row.active,
                    seriesIdx: row.seriesIdx,
                    percentValue:
                        typeof row.transformed === 'number' ? row.transformed.toFixed(1) : '',
                } as TooltipLine),
        ),
        withPercent: calcOption<boolean>(opts.percent),
        hiddenRowsNumber: hiddenRowsNumber as number,
        hiddenRowsSum,
    };

    if (sum) {
        tooltipFormatOptions.sum = valueFormatter(sumTotal);
    }

    return formatTooltip(tooltipFormatOptions, {
        lastVisibleRowIndex: state.pinned ? rows.length - 1 : maxLines - 1,
    });
};
