const TOOLTIP_HEADER_CLASS_NAME = '_tooltip-header';
const TOOLTIP_LIST_CLASS_NAME = '_tooltip-list';

// @ts-ignore
export function synchronizeTooltipTablesCellsWidth(tooltipContainer) {
    const tHeadNode = tooltipContainer.querySelector(`.${TOOLTIP_HEADER_CLASS_NAME}`);
    const tBodyNode = tooltipContainer.querySelector(`.${TOOLTIP_LIST_CLASS_NAME}`);

    if (!tHeadNode || !tHeadNode.children.length) {
        return false;
    }

    const tHeadNodeFirstRow = tHeadNode.children[0];
    for (let j = 0; j < tHeadNodeFirstRow.children.length; j++) {
        const cell = tHeadNodeFirstRow.children[j];
        cell.removeAttribute('style');
        if (tBodyNode.children.length === 1) {
            cell.innerHTML = '&nbsp;';
        }
    }

    const tBodyNodeFirstRow = tBodyNode.children[0];
    for (let j = 0; j < tBodyNodeFirstRow.children.length; j++) {
        const cell = tBodyNodeFirstRow.children[j];
        cell.removeAttribute('style');
    }

    const tHeadRowsWidth = tHeadNode.children[0].getBoundingClientRect().width;
    const tBodyRowsWidth = tBodyNode.children[0].getBoundingClientRect().width;

    const nodeWithWidesRows = tHeadRowsWidth > tBodyRowsWidth ? tHeadNode : tBodyNode;
    const nodeWithWidesRowsCellsWidth = Array.prototype.reduce.call(
        nodeWithWidesRows.children[0].children,
        (accum, cellNode) => {
            // @ts-ignore
            accum.push(cellNode.getBoundingClientRect().width);
            return accum;
        },
        [],
    );

    const nodeToSetCellsWidth = nodeWithWidesRows === tHeadNode ? tBodyNode : tHeadNode;
    const nodeToSetCellsWidthFirstRow = nodeToSetCellsWidth.children[0];

    for (let j = 0; j < nodeToSetCellsWidthFirstRow.children.length; j++) {
        const cell = nodeToSetCellsWidthFirstRow.children[j];
        // @ts-ignore
        cell.setAttribute('style', `width: ${nodeWithWidesRowsCellsWidth[j]}px`);
    }

    if (tBodyNode.children.length === 1) {
        for (const cell of tHeadNodeFirstRow.children) {
            cell.innerHTML = '';
        }
    }
}
