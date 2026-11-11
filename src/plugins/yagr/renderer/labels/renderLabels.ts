import type {Yagr, YagrConfig, YagrSeriesPointLabels} from '../../types';

const LABEL_OFFSET = 4;
const LABEL_FONT_SIZE = 12;
const LABEL_FONT_WEIGHT = 500;

function renderLabels(u: Yagr['uplot'], chart: Yagr) {
    const chartSeries: (Yagr['uplot']['series'][number] & YagrSeriesPointLabels)[] = u.series;
    if (!chartSeries.some((series) => series.pointLabels?.length)) {
        return;
    }

    const {ctx, bbox} = u;
    const pixelRatio = ctx.canvas.width / u.width;
    const style = getComputedStyle(u.root);
    const labelHeight = LABEL_FONT_SIZE * pixelRatio;
    const offset = LABEL_OFFSET * pixelRatio;
    const plotRight = bbox.left + bbox.width;
    const plotBottom = bbox.top + bbox.height;

    ctx.save();
    try {
        ctx.beginPath();
        ctx.rect(bbox.left, bbox.top, bbox.width, bbox.height);
        ctx.clip();
        ctx.font = `${LABEL_FONT_WEIGHT} ${labelHeight}px ${style.fontFamily}`;
        ctx.fillStyle = style.getPropertyValue('--g-color-text-primary') || style.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';

        chartSeries.forEach((series, seriesIndex) => {
            if (
                !seriesIndex ||
                !series.show ||
                series.showInGraph === false ||
                !series.pointLabels
            ) {
                return;
            }

            const scale = series.scale || 'y';
            const stacking = chart.config.scales?.[scale]?.stacking;
            series.pointLabels.forEach((label, pointIndex) => {
                const value = series.$c[pointIndex];
                const coordinate = u.data[seriesIndex][pointIndex];
                if (
                    label === null ||
                    label === '' ||
                    typeof value !== 'number' ||
                    !Number.isFinite(value) ||
                    coordinate === null ||
                    coordinate === undefined ||
                    !Number.isFinite(coordinate)
                ) {
                    return;
                }

                const x = u.valToPos(u.data[0][pointIndex], 'x', true);
                let y = u.valToPos(coordinate, scale, true);
                if (series.type === 'column') {
                    const segmentValue = series.normalizedData?.[pointIndex] ?? value;
                    const base = stacking ? coordinate - segmentValue : 0;
                    y = Math.min(y, u.valToPos(base, scale, true));
                }

                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(y) ||
                    x < bbox.left ||
                    x > plotRight ||
                    y < bbox.top ||
                    y > plotBottom
                ) {
                    return;
                }

                const labelWidth = ctx.measureText(label).width;
                if (labelWidth > bbox.width || labelHeight > bbox.height) {
                    return;
                }

                const halfWidth = labelWidth / 2;
                const labelX = Math.max(bbox.left + halfWidth, Math.min(x, plotRight - halfWidth));
                const labelY = Math.max(bbox.top + labelHeight, Math.min(y - offset, plotBottom));

                ctx.fillText(label, labelX, labelY);
            });
        });
    } finally {
        ctx.restore();
    }
}

export function getLabelHooks(existingHooks: YagrConfig['hooks'] = {}) {
    let chart: Yagr | undefined;
    const hooks: YagrConfig['hooks'] = {...existingHooks};

    hooks.processed = [
        ...(hooks.processed || []),
        (event) => {
            chart = event.chart;
        },
    ];

    hooks.draw = [
        ...(hooks.draw || []),
        (u) => {
            if (chart) {
                chart.canvas = u.ctx.canvas;
                renderLabels(u, chart);
            }
        },
    ];

    return hooks;
}
