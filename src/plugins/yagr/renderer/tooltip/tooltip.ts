/* eslint complexity: 0 */

import {i18n} from '../../../../i18n';
import {escapeHTML} from './helpers/escapeHTML';
import type {TooltipData, TooltipExtraData, TooltipLine, RowRenderingConfig} from './types';

import './tooltip.scss';

const SERIES_NAME_DATA_ATTRIBUTE = 'data-series-name';
const SERIES_IDX_DATA_ATTRIBUTE = 'data-series-idx';
const TOOLTIP_CONTAINER_CLASS_NAME = '_tooltip';
const TOOLTIP_ROW_NAME_CLASS_NANE = '_tooltip-rows__name-td';
const TOOLTIP_ROW_CLASS_NAME = '_tooltip-row';
const TOOLTIP_HEADER_CLASS_NAME = '_tooltip-header';
const TOOLTIP_LIST_CLASS_NAME = '_tooltip-list';
const TOOLTIP_FOOTER_CLASS_NAME = '_tooltip-footer';

const renderEmptyCell = () => '<td />';

const renderColorCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__bubble-td">
        <div class="_tooltip-rows__bubble-div" style="background-color:${line.seriesColor};"></div>
    </td>`;

const renderNameCell = (line: TooltipLine) =>
    `<td class="${TOOLTIP_ROW_NAME_CLASS_NANE}">
        ${line.hideSeriesName ? '' : escapeHTML(line.seriesName)}
    </td>`;

const renderPercentCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__percent-td">
        ${line.percentValue ? line.percentValue + '%' : ''}
    </td>`;

const renderValueCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__value-td">
        ${line.value}
    </td>`;

const renderDiffCell = (line: TooltipLine) =>
    `<td class="_tooltip-rows__diff-td">
        ${line.diff ? ` (${line.diff})` : ''}
    </td>`;

const renderAdditionalSection = (data: TooltipData, splitTooltip = false, colspanNumber = 1) => {
    return `<td class="_tooltip-right__td ${
        splitTooltip ? '_tooltip-right__td_with-split-tooltip' : ''
    }" colspan="${colspanNumber || 1}">
             ${
                 data.holiday
                     ? `<div class="_tooltip-right__holiday-div">
                    <div class="_tooltip-right__holiday-emoji">🎈</div>
                    <div>
                        ${data.holidayText}
                        ${
                            data.region
                                ? `<span class="_tooltip-right__holiday-region">[${data.region}]</span>`
                                : ''
                        }
                    </div>
                </div>`
                     : ''
             }

            ${
                data.commentDateText
                    ? `<div class="${data.xComments ? '_tooltip-right__margin-bot' : ''}">${
                          data.commentDateText
                      }</div>`
                    : ''
            }

            ${
                data.xComments
                    ? data.xComments
                          .map(
                              (comment) =>
                                  `<div class="_tooltip-right__traf-div ${
                                      splitTooltip
                                          ? '_tooltip-right__traf-div_for-split-tooltip'
                                          : ''
                                  }" style="border-color: ${comment.color};">${comment.text}</div>`,
                          )
                          .join('')
                    : ''
            }
        </td>`;
};

const renderRow = (
    line: TooltipLine,
    {
        isSelectedLine,
        cellsRenderers,
        isSingleLine,
        allowComment,
        withDarkBackground,
        rowIndex,
    }: RowRenderingConfig,
) => {
    const hasComment = line.commentText || line.xyCommentText;
    const needRenderComment = allowComment && hasComment;
    const fullCellsRenderers = cellsRenderers.slice();

    const rowKey = `${String(rowIndex) || ''}-${String(escapeHTML(line.seriesName))
        .slice(0, 20)
        .replace(/(\r\n|\n|\r)/gm, '')}`;

    if (line.insertCellAt) {
        (Object.keys(line.insertCellAt) || []).forEach((index) => {
            fullCellsRenderers.splice(Number(index), 0, renderEmptyCell);
        });
    }

    if (line.customRender) {
        return `<tr class="${TOOLTIP_ROW_CLASS_NAME}${
            isSelectedLine ? ' _tooltip-selected-row' : ''
        }${isSingleLine ? ' _tooltip-uniq-row' : ''}${
            withDarkBackground ? ' _tooltip-row-dark-bg' : ''
        }" ${SERIES_NAME_DATA_ATTRIBUTE}="${rowKey}" ${
            line.seriesIdx ? `${SERIES_IDX_DATA_ATTRIBUTE}="${line.seriesIdx}"` : ''
        }>
            ${
                line.customRender.trim().indexOf('<td') === 0
                    ? line.customRender
                    : `<td colspan="${cellsRenderers.length}">${line.customRender}</td>`
            }
        </tr>
        ${
            needRenderComment
                ? `<tr class="_tooltip-comment-row${
                      isSelectedLine ? ' _tooltip-selected-row' : ''
                  }${withDarkBackground ? ' _tooltip-row-dark-bg' : ''}">
                    <td>
                        ${
                            line.commentText
                                ? `<div class="_tooltip-rows__comment-div">${line.commentText}</div>`
                                : ''
                        }
                        ${
                            line.xyCommentText
                                ? `<div class="_tooltip-rows__comment-div">${line.xyCommentText}</div>`
                                : ''
                        }
                    </td>
                </tr>`
                : ''
        }`;
    }

    return `<tr class="${TOOLTIP_ROW_CLASS_NAME}${isSelectedLine ? ' _tooltip-selected-row' : ''}${
        isSingleLine ? ' _tooltip-uniq-row' : ''
    }${
        withDarkBackground ? ' _tooltip-row-dark-bg' : ''
    }" ${SERIES_NAME_DATA_ATTRIBUTE}="${rowKey}" ${
        line.seriesIdx ? `${SERIES_IDX_DATA_ATTRIBUTE}="${line.seriesIdx}"` : ''
    }>
            ${fullCellsRenderers
                .map((render, index) => {
                    if (line.replaceCellAt && line.replaceCellAt[index]) {
                        return typeof line.replaceCellAt[index] === 'string'
                            ? line.replaceCellAt[index]
                            : line.replaceCellAt[index](line);
                    } else if (line.insertCellAt && line.insertCellAt[index]) {
                        return typeof line.insertCellAt[index] === 'string'
                            ? line.insertCellAt[index]
                            : line.insertCellAt[index](line);
                    } else {
                        return render(line);
                    }
                })
                .join('')}
        </tr>

        ${
            needRenderComment
                ? `<tr class="_tooltip-comment-row${
                      isSelectedLine ? ' _tooltip-selected-row' : ''
                  }${withDarkBackground ? ' _tooltip-row-dark-bg' : ''}">
                    <td colspan="4">
                        ${
                            line.commentText
                                ? `<div class="_tooltip-rows__comment-div">${line.commentText}</div>`
                                : ''
                        }
                        ${
                            line.xyCommentText
                                ? `<div class="_tooltip-rows__comment-div">${line.xyCommentText}</div>`
                                : ''
                        }
                    </td>
                </tr>`
                : ''
        }`;
};

export const formatTooltip = (data: TooltipData, tooltip: TooltipExtraData) => {
    const {splitTooltip, activeRowAlwaysFirstInTooltip} = data;
    const selectedLineIndex = data.lines.findIndex(({selectedSeries}) => selectedSeries);
    const selectedLine = data.lines[selectedLineIndex];
    const lines = data.lines.slice(0, (tooltip.lastVisibleRowIndex || data.lines.length) + 1);

    const cellsRenderers = [];
    cellsRenderers.push(renderColorCell);

    if (data.shared) {
        cellsRenderers.push(renderNameCell);
    }

    if (data.withPercent) {
        cellsRenderers.push(renderPercentCell);
    }

    cellsRenderers.push(renderValueCell);

    if (data.useCompareFrom) {
        cellsRenderers.push(renderDiffCell);
    }

    const rowRenderingConfig = {
        isSingleLine: lines.length === 1,
        cellsRenderers,
    };

    const rowRenderingConfigForSelectedLine = {
        cellsRenderers,
        useCompareFrom: data.useCompareFrom,
        isSelectedLine: true,
        allowComment: selectedLineIndex > tooltip.lastVisibleRowIndex,
    };

    const windowHeight =
        // @ts-ignore
        document.body.clientHeight / ((window.visualViewport && window.visualViewport.scale) || 1);

    function getRowRenderConfig(index: number) {
        return {
            ...rowRenderingConfig,
            rowIndex: index,
            isSelectedLine: lines.length > 1 && index === selectedLineIndex,
            withDarkBackground: lines.length > 2 && Boolean(index % 2),
            allowComment:
                index !== selectedLineIndex || !rowRenderingConfigForSelectedLine.allowComment,
        };
    }

    let tooltipContainerClassNames = TOOLTIP_CONTAINER_CLASS_NAME;

    if (splitTooltip) {
        tooltipContainerClassNames += ` ${TOOLTIP_CONTAINER_CLASS_NAME}_split-tooltip`;
    }

    return `
<div class="${tooltipContainerClassNames}" style="max-height: ${
        splitTooltip ? 'auto' : `${windowHeight}px`
    }">
    ${
        data.tooltipHeader
            ? `<div title="${(
                  document.createRange().createContextualFragment(data.tooltipHeader).textContent ||
                  ''
              ).trim()}" class="_tooltip-date">
                ${data.tooltipHeader.trim()}
            </div>`
            : ''
    }
    ${
        splitTooltip &&
        (data.holiday || data.commentDateText || (data.xComments && data.xComments.length))
            ? `<table border="0" cellpadding="0" cellspacing="0">
                <tbody>
                    <tr>
                        ${renderAdditionalSection(data, true, cellsRenderers.length)}
                    </tr>
                </tbody>
            </table>`
            : ''
    }
    <table border="0" cellpadding="0" cellspacing="0">
        <tr>
            <td class="_tooltip-left__td">
                <table class="_tooltip-rows__table">
                    ${
                        splitTooltip
                            ? ''
                            : `<thead class=${TOOLTIP_HEADER_CLASS_NAME}>
                                ${
                                    selectedLine &&
                                    (activeRowAlwaysFirstInTooltip ||
                                        (tooltip.lastVisibleRowIndex &&
                                            selectedLineIndex > tooltip.lastVisibleRowIndex))
                                        ? renderRow(selectedLine, rowRenderingConfigForSelectedLine)
                                        : ''
                                }
                                <tr class="_tooltip-fake-row">${Array(cellsRenderers.length)
                                    .fill('<td></td>')
                                    .join('')}</tr>
                            </thead>`
                    }
                    <tbody class="${TOOLTIP_LIST_CLASS_NAME}">
                        ${lines
                            .map((line, index) => renderRow(line, getRowRenderConfig(index)))
                            .join('')}
                    </tbody>
                    ${
                        splitTooltip
                            ? ''
                            : `<tbody class="${TOOLTIP_FOOTER_CLASS_NAME}">
                                ${
                                    tooltip.lastVisibleRowIndex && data.hiddenRowsNumber > 0
                                        ? `<tr class="${TOOLTIP_ROW_CLASS_NAME} _hidden-rows-sum${
                                              lines.length % 2 ? ' _hidden-rows-sum-dark-bg' : ''
                                          }">
                                            <td colspan="${
                                                cellsRenderers.length - 1
                                            }" class="_hidden-rows-number">
                                                ${i18n('common', 'tooltip-rest')} ${
                                              data.hiddenRowsNumber
                                          }
                                            </td>
                                            <td class="_hidden-rows-value">${
                                                data.hiddenRowsSum
                                            }</td>
                                        </tr>`
                                        : ''
                                }
                                <tr class="_tooltip-fake-row">${Array(cellsRenderers.length)
                                    .fill('<td></td>')
                                    .join('')}</tr>
                                ${
                                    data.sum
                                        ? `<tr class="_tooltip-rows__summ-tr">
                                            <td class="_tooltip-rows__summ-td" colspan="${
                                                cellsRenderers.length - 1
                                            }">${i18n('common', 'tooltip-sum')}</td>
                                            <td class="_tooltip-rows__summ-td _tooltip-rows__summ-td-value">
                                                ${data.sum}
                                            </td>
                                        </tr>`
                                        : ''
                                }
                            </tbody>`
                    }
                </table>
            </td>

            ${
                !splitTooltip &&
                (data.holiday || data.commentDateText || (data.xComments && data.xComments.length))
                    ? renderAdditionalSection(data)
                    : ''
            }
        </tr>
    </table>
</div>`;
};
