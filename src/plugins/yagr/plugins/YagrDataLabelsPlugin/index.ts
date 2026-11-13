import type {RawSerieData, YagrPlugin} from '@gravity-ui/yagr';

import type {Yagr, YagrGraph} from '../../types';

type LabeledSeries = RawSerieData & Pick<YagrGraph, '_data' | 'dataLabels'>;

type PositionedLabel = {
    text: string;
    x: number;
    y: number;
    left: number;
    right: number;
    top: number;
    bottom: number;
};

function isOverlapping(first: PositionedLabel, second: PositionedLabel) {
    return (
        first.left < second.right &&
        first.right > second.left &&
        first.top < second.bottom &&
        first.bottom > second.top
    );
}

function drawLabels(yagr: Yagr, u: Yagr['uplot']) {
    const seriesIndexById = new Map(u.series.map((series, index) => [series.id, index]));
    const {ctx, bbox} = u;
    const pixelRatio = ctx.canvas.width / u.width;
    const style = getComputedStyle(yagr.root);
    const fontSize = 11 * pixelRatio;
    const right = bbox.left + bbox.width;
    const bottom = bbox.top + bbox.height;
    const placedLabels: PositionedLabel[] = [];

    ctx.save();

    try {
        ctx.beginPath();
        ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height);
        ctx.clip();
        ctx.font = `bold ${fontSize}px ${style.fontFamily}`;
        ctx.fillStyle = yagr.utils.colors.parse('var(--g-color-text-secondary)');
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        // Process later input series first so their labels take priority.
        [...yagr.config.series].reverse().forEach((series: LabeledSeries) => {
            if (series.id === undefined) {
                return;
            }

            const seriesIndex = seriesIndexById.get(series.id);
            if (!seriesIndex) {
                return;
            }

            const uplotSeries = u.series[seriesIndex];
            if (uplotSeries.show === false || uplotSeries.showInGraph === false) {
                return;
            }

            const type =
                uplotSeries.type ?? series.type ?? yagr.config.chart.series?.type ?? 'line';

            if (type !== 'line' || !series.dataLabels?.enabled) {
                return;
            }

            const padding = (series.dataLabels.padding ?? 5) * pixelRatio;
            const scale = uplotSeries.scale || 'y';
            const labels: PositionedLabel[] = [];

            series.data.forEach((rawValue, pointIndex) => {
                const label = series._data?.[pointIndex]?.label ?? String(rawValue);
                const time = u.data[0][pointIndex];
                const value = u.data[seriesIndex][pointIndex];

                if (
                    !label ||
                    rawValue === null ||
                    time === undefined ||
                    value === null ||
                    value === undefined ||
                    !Number.isFinite(value)
                ) {
                    return;
                }

                const x = u.valToPos(time, 'x', true);
                const y = u.valToPos(value, scale, true);

                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(y) ||
                    x < bbox.left ||
                    x > right ||
                    y < bbox.top ||
                    y > bottom
                ) {
                    return;
                }

                const metrics = ctx.measureText(label);
                const halfWidth = Math.min(metrics.width, bbox.width) / 2;

                const labelX = Math.max(bbox.left + halfWidth, Math.min(x, right - halfWidth));
                const labelY = Math.max(
                    bbox.top + Math.max(0, padding) + metrics.actualBoundingBoxAscent,
                    Math.min(y - padding, bottom - metrics.actualBoundingBoxDescent),
                );

                labels.push({
                    text: label,
                    x: labelX,
                    y: labelY,
                    left: labelX - metrics.width / 2,
                    right: labelX + metrics.width / 2,
                    top: labelY - metrics.actualBoundingBoxAscent,
                    bottom: labelY + metrics.actualBoundingBoxDescent,
                });
            });

            if (!series.dataLabels.allowOverlap) {
                labels.sort((first, second) => first.top - second.top || first.left - second.left);
            }

            for (const label of labels) {
                if (
                    !series.dataLabels.allowOverlap &&
                    placedLabels.some((placed) => isOverlapping(label, placed))
                ) {
                    continue;
                }

                ctx.fillText(label.text, label.x, label.y);
                placedLabels.push(label);
            }
        });
    } finally {
        ctx.restore();
    }
}

export const YagrDataLabelsPlugin: YagrPlugin = (yagr) => ({
    uplot: {hooks: {draw: [(u) => drawLabels(yagr, u)]}},
});
