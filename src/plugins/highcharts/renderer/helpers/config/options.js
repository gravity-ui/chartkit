/** Default options for Highcharts & Highstock */

import merge from 'lodash/merge';

import {i18n} from '../../../../../i18n';
import {block} from '../../../../../utils/cn';

import {getChartKitFormattedValue} from './utils';
import LocalStorage from './utils/localStorage';

const b = block('tooltip');

function getTooltipHeaderFormat(format, showColor) {
    return `<div class="${b('header')}">
        ${
            showColor
                ? `<span class="${b('color')}" style="background-color:{point.color};"></span>`
                : ''
        }
        ${format}
    </div>`;
}

function getTooltipPointFormat(cells, showColor) {
    return `<div class="${b('row')}">
        ${
            typeof showColor === 'boolean'
                ? `<div class="${b('cell')}">
                <span class="${b('color')}" ${
                    showColor ? 'style="background-color:{point.color};"' : ''
                }></span>
            </div>`
                : ''
        }
        ${cells.map((cell) => `<div class="${b('cell')}">${cell}</div>`).join('')}
    </div>`;
}

function getFlowClear() {
    return '<span/>';
}

function getDataLabelsFormatter(getValue) {
    return function dataLabelsFormatter() {
        const value = getValue(this);

        if (typeof value === 'number' && this.series.options.dataLabels?.chartKitFormatting) {
            return getChartKitFormattedValue(
                this.series.options.dataLabels,
                value,
                this.percentage,
            );
        }

        return value;
    };
}

const first = {
    states: {
        hover: {
            lineWidthPlus: 1,
        },
    },
    dataGrouping: {
        approximation: 'open',
    },
    marker: {
        enabled: false,
        radius: 3,
        states: {
            hover: {
                radiusPlus: 1,
            },
        },
    },
};

const second = {
    allowPointSelect: true,
    slicedOffset: 0,
    cursor: 'pointer',
    showInLegend: true,
};

const wizardGraphDataLabels = {
    dataLabels: {
        formatter: getDataLabelsFormatter(function (point) {
            return point.point.label ?? point.point.value ?? point.y;
        }),
    },
};

const notChangeOpacityForInactive = {
    states: {
        inactive: {
            enabled: false,
        },
    },
};

const statesForLine = {
    states: {
        hover: {
            animation: {
                duration: 500,
                easing: 'easeInQuint',
            },
            lineWidth: 4,
            opacity: 1,
        },
        inactive: {
            opacity: 1,
        },
    },
};

const options = {
    chart: {
        zoomType: 'xy',
        backgroundColor: 'transparent',
        className: 'chartkit-highcharts',
    },
    title: {
        style: {
            color: 'var(--highcharts-title)',
        },
    },
    tooltip: {
        split: false,
        shared: true,
        outside: true,
        followPointer: true,
        dateTimeLabelFormats: {
            millisecond: '%d %B %Y %H:%M:%S.%L',
            second: '%d %B %Y %H:%M:%S',
            minute: '%d %B %Y %H:%M',
            hour: '%d %B %Y %H:%M',
            day: '%d %B %Y %A',
            week: '%d %B %Y',
            quarter: "%Q'%Y",
        },
    },
    legend: {
        itemStyle: {
            color: 'var(--highcharts-legend-item)',
        },
        itemHoverStyle: {
            color: 'var(--highcharts-legend-item-hover)',
        },
        itemHiddenStyle: {
            color: 'var(--highcharts-legend-item-hidden)',
        },
    },
    xAxis: {
        crosshair: false,
        gridLineColor: 'var(--highcharts-grid-line)',
        lineColor: 'var(--highcharts-axis-line)',
        labels: {
            style: {
                color: 'var(--highcharts-axis-labels)',
            },
        },
        tickPixelInterval: 120,
        tickColor: 'var(--highcharts-tick)',
        tickmarkPlacement: 'on',
        dateTimeLabelFormats: {
            day: '%d.%m.%y',
            week: '%d.%m.%y',
            quarter: "%Q'%Y",
        },
    },
    yAxis: {
        gridLineColor: 'var(--highcharts-grid-line)',
        lineColor: 'var(--highcharts-axis-line)',
        labels: {
            style: {
                color: 'var(--highcharts-axis-labels)',
            },
        },
        tickColor: 'var(--highcharts-tick)',
        stackLabels: {
            style: {
                textOutline: 'none',
                color: 'var(--highcharts-data-labels)',
            },
        },
        title: {
            style: {
                color: 'var(--g-color-text-secondary)',
            },
        },
    },
    plotOptions: {
        series: {
            borderColor: 'var(--highcharts-series-border)',
            label: {
                enabled: false,
            },
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{point.key}'),
                pointFormat: getTooltipPointFormat(
                    [`<span class=${b('series-name')}>{series.name}</span>`, '{point.y}'],
                    true,
                ),
            },
            dataLabels: {
                style: {
                    textOutline: 'none',
                    color: 'var(--highcharts-data-labels)',
                },
            },
            turboThreshold: 0,
        },
        area: Object.assign(
            {
                boostThreshold: 0, // https://jsfiddle.net/2ahd7c9b
            },
            first,
            wizardGraphDataLabels,
            statesForLine,
        ),
        areaspline: first,
        bar: Object.assign({}, first, wizardGraphDataLabels, notChangeOpacityForInactive),
        column: Object.assign({}, first, wizardGraphDataLabels, notChangeOpacityForInactive),
        line: Object.assign({}, first, wizardGraphDataLabels, statesForLine),
        spline: first,
        arearange: Object.assign(
            {
                tooltip: {
                    pointFormat: getTooltipPointFormat(
                        ['{point.low} - {point.high}', '{series.name}'],
                        true,
                    ),
                },
            },
            first,
        ),
        scatter: {
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{series.name}', true),
                pointFormat: getTooltipPointFormat([
                    '<div>X: {point.x}</div><div>Y: {point.y}<div/>',
                ]),
            },
        },
        bubble: {
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{series.name}', true),
                pointFormat: getTooltipPointFormat([
                    `({point.x}, {point.y}), ${i18n(
                        'chartkit',
                        'tooltip-point-format-size',
                    )}: {point.z}`,
                ]),
            },
        },
        sankey: {
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{series.name}', true),
                pointFormat: getTooltipPointFormat([
                    '{point.fromNode.name} → {point.toNode.name}: <b>{point.weight}</b>',
                ]),
            },
        },
        heatmap: {
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{series.name}', true),
                pointFormat: getTooltipPointFormat(['{point.x}, {point.y}: {point.value}']),
            },
        },
        treemap: {
            tooltip: {
                headerFormat: null,
                pointFormat: getTooltipPointFormat(['<b>{point.name}</b>: {point.value}']),
            },
        },
        timeline: {
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{point.key}', true),
                pointFormat: `
                    <div class="${b('point-container', {type: 'timeline'})}">
                        <div>{point.description}</div>
                    </div>
                `,
            },
        },
        variwide: {},
        waterfall: {},
        pie: Object.assign(
            {
                tooltip: {
                    headerFormat: null,
                    pointFormat: getTooltipPointFormat(['{point.y}', '{point.name}'], true),
                },
                dataLabels: {
                    formatter: getDataLabelsFormatter(function (point) {
                        return (
                            point.point.label ??
                            // https://api.highcharts.com/highcharts/plotOptions.pie.dataLabels.formatter
                            (point.point.isNull ? undefined : point.point.name)
                        );
                    }),
                },
            },
            second,
            notChangeOpacityForInactive,
        ),
        histogram: {
            tooltip: {
                headerFormat: null,
                pointFormat:
                    getTooltipHeaderFormat('{point.x} - {point.x2}') +
                    getTooltipPointFormat(['{point.y}', '{series.name}'], true),
            },
        },
        bellcurve: {},
        streamgraph: {},
        ohlc: {
            tooltip: {
                pointFormat:
                    getTooltipPointFormat(['{series.name}'], true) +
                    getTooltipPointFormat(['', '{point.open}', 'Open']) +
                    getTooltipPointFormat(['', '{point.high}', 'High']) +
                    getTooltipPointFormat(['', '{point.low}', 'Low']) +
                    getTooltipPointFormat(['', '{point.close}', 'Close']),
            },
        },
        ema: {},
        sma: {},
        wordcloud: {
            tooltip: {
                pointFormat: getTooltipPointFormat(['{point.weight}', '{series.name}'], true),
            },
        },
        xrange: {
            tooltip: {
                headerFormat: getTooltipHeaderFormat('{point.x} - {point.x2}'),
                pointFormat: getTooltipPointFormat(['{point.yCategory}', '{series.name}'], true),
            },
        },
        solidgauge: second,
        funnel: second,
        boxplot: {
            tooltip: {
                pointFormat:
                    getTooltipPointFormat(['{series.name}'], true) +
                    getFlowClear() +
                    getTooltipPointFormat(['{point.high}', 'Maximum'], false) +
                    getTooltipPointFormat(['{point.q3}', 'Upper quartile'], false) +
                    getTooltipPointFormat(['{point.median}', 'Median'], false) +
                    getTooltipPointFormat(['{point.q1}', 'Lower quartile'], false) +
                    getTooltipPointFormat(['{point.low}', 'Minimum'], false),
            },
        },
    },
    exporting: {
        buttons: {
            contextButton: {
                enabled: false,
            },
        },
    },
    rangeSelector: {
        enabled: false,
        inputEnabled: false,
    },
    scrollbar: {
        enabled: false,
        barBackgroundColor: 'var(--highcarts-navigator-body)',
        barBorderColor: 'var(--highcarts-navigator-border)',
        buttonArrowColor: 'var(--highcarts-navigator-track)',
        buttonBorderColor: 'var(--highcarts-navigator-border)',
        buttonBackgroundColor: 'var(--highcarts-navigator-body)',
        trackBackgroundColor: 'var(--highcarts-navigator-track)',
        trackBorderColor: 'var(--highcarts-navigator-border)',
    },
    navigator: {
        height: 30,
        outlineColor: 'var(--highcarts-navigator-border)',
        xAxis: {
            gridLineColor: 'var(--highcarts-navigator-border)',
        },
        handles: {
            backgroundColor: 'var(--highcarts-navigator-track)',
            borderColor: 'var(--highcarts-navigator-body)',
        },
    },
};

const externalOptions = LocalStorage.restore('__chartkit_highcharts_external_options');

if (externalOptions) {
    try {
        merge(options, externalOptions);
    } catch (error) {
        console.error(error);
    }
}

export default options;
