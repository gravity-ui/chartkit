import type {Chart, SeriesZonesOptionsObject, BBoxObject, OffsetObject} from 'highcharts';
import type {HighchartsWidgetData} from '../types';

/**
 * Get the X coordinate of the intersection of the two lines 1-2 and 3-4.
 * @param x1 {number} X-coordinate of the first point of the first line.
 * @param y1 {number} Y-coordinate of the first point of the first line.
 * @param x2 {number} X-coordinate of the second point of the first line.
 * @param y2 {number} Y-coordinate of the second point of the first line.
 * @param x3 {number} X-coordinate of the first point of the second line.
 * @param y3 {number} Y-coordinate of the first point of the second line.
 * @param x4 {number} X-coordinate of the second point of the second line.
 * @param y4 {number} Y-coordinate of the second point of the second line.
 * @returns {number} X-coordinate of the intersection.
 */
function getIntersectionX(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    x4: number,
    y4: number,
) {
    return Math.trunc(
        ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) /
            ((x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)),
    );
}

/**
 * Get the colored zones for the area chart.
 * @param counts {object} Area chart data.
 * @param createdColor {string} Color (html notation) for the positive zone.
 * @param resolvedColor {string} Color (html notation) for the negative zone.
 * @returns {SeriesZonesOptionsObject[]} Highcharts zones for area chart.
 */
function getZones(
    counts: {created: number; resolved: number; to: number}[],
    createdColor: string,
    resolvedColor: string,
): SeriesZonesOptionsObject[] {
    const zones: SeriesZonesOptionsObject[] = [];

    let positive: boolean | undefined;
    let color: string | undefined;
    let prev: (typeof counts)[number] | undefined;

    for (const count of counts) {
        const isPositive = count.created - count.resolved >= 0;

        if (isPositive !== positive) {
            if (color && prev) {
                const value = getIntersectionX(
                    prev.to,
                    prev.created,
                    count.to,
                    count.created,
                    prev.to,
                    prev.resolved,
                    count.to,
                    count.resolved,
                );

                zones.push({color, value});
            }

            positive = isPositive;
            color = isPositive ? createdColor : resolvedColor;
        }

        prev = count;
    }

    if (color) {
        zones.push({color});
    }

    return zones;
}

/**
 * Get parameters for a rectangle between two charts. This rectangle
 * is used to visually separate the areas of the two charts.
 * @param chart {Chart} Highcharts chart object.
 * @returns {object} Parameters for rectangle.
 */
function getDividerRect(chart: Chart): {
    x: number;
    y: number;
    width: number;
    height: number;
} {
    const gridLineWidth = 1;
    const xAxis = chart.xAxis[0] as unknown as BBoxObject & OffsetObject;
    const yAxis0 = chart.yAxis[0] as unknown as BBoxObject & OffsetObject;
    const yAxis1 = chart.yAxis[1] as unknown as BBoxObject & OffsetObject;
    const x = xAxis.left;
    const y = yAxis0.top + yAxis0.height + gridLineWidth;
    const width = xAxis.width;
    const height = yAxis1.top - yAxis0.top - yAxis0.height - gridLineWidth * 2;

    return {x, y, width, height};
}

const rawData = [
    {
        from: '2020-04-01T00:00:00Z',
        to: '2020-05-01T00:00:00Z',
        created: 42,
        resolved: 10,
        trend: 32,
    },
    {
        from: '2020-05-01T00:00:00Z',
        to: '2020-06-01T00:00:00Z',
        created: 53,
        resolved: 30,
        trend: 55,
    },
    {
        from: '2020-06-01T00:00:00Z',
        to: '2020-07-01T00:00:00Z',
        created: 35,
        resolved: 28,
        trend: 62,
    },
    {
        from: '2020-07-01T00:00:00Z',
        to: '2020-08-01T00:00:00Z',
        created: 30,
        resolved: 19,
        trend: 73,
    },
    {
        from: '2020-08-01T00:00:00Z',
        to: '2020-09-01T00:00:00Z',
        created: 18,
        resolved: 23,
        trend: 68,
    },
    {
        from: '2020-09-01T00:00:00Z',
        to: '2020-10-01T00:00:00Z',
        created: 29,
        resolved: 22,
        trend: 75,
    },
    {
        from: '2020-10-01T00:00:00Z',
        to: '2020-11-01T00:00:00Z',
        created: 24,
        resolved: 26,
        trend: 73,
    },
    {
        from: '2020-11-01T00:00:00Z',
        to: '2020-12-01T00:00:00Z',
        created: 19,
        resolved: 21,
        trend: 71,
    },
    {
        from: '2020-12-01T00:00:00Z',
        to: '2021-01-01T00:00:00Z',
        created: 22,
        resolved: 22,
        trend: 71,
    },
    {
        from: '2021-01-01T00:00:00Z',
        to: '2021-02-01T00:00:00Z',
        created: 17,
        resolved: 17,
        trend: 71,
    },
    {
        from: '2021-02-01T00:00:00Z',
        to: '2021-03-01T00:00:00Z',
        created: 30,
        resolved: 26,
        trend: 75,
    },
    {
        from: '2021-03-01T00:00:00Z',
        to: '2021-04-01T00:00:00Z',
        created: 28,
        resolved: 12,
        trend: 91,
    },
    {
        from: '2021-04-01T00:00:00Z',
        to: '2021-05-01T00:00:00Z',
        created: 11,
        resolved: 15,
        trend: 87,
    },
    {
        from: '2021-05-01T00:00:00Z',
        to: '2021-06-01T00:00:00Z',
        created: 9,
        resolved: 4,
        trend: 92,
    },
    {
        from: '2021-06-01T00:00:00Z',
        to: '2021-07-01T00:00:00Z',
        created: 12,
        resolved: 12,
        trend: 92,
    },
    {
        from: '2021-07-01T00:00:00Z',
        to: '2021-08-01T00:00:00Z',
        created: 13,
        resolved: 17,
        trend: 88,
    },
    {
        from: '2021-08-01T00:00:00Z',
        to: '2021-09-01T00:00:00Z',
        created: 3,
        resolved: 14,
        trend: 77,
    },
];

const counts = rawData.map(({created, resolved, trend, from, to}) => ({
    created,
    resolved,
    trend,
    from: Date.parse(from),
    to: Date.parse(to),
}));

const arearange = counts.map(({created, resolved, to}) => [to, resolved, created]);

const createdLine = counts.map(({created, to}) => [to, created]);

const resolvedLine = counts.map(({resolved, to}) => [to, resolved]);

const trends = counts.map(({trend, to}) => [to, trend]);

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                type: 'arearange',
                data: arearange,
                yAxis: 0,
                opacity: 0.5,
                zones: getZones(counts, '#FF3D64', '#8AD554'),
            },
            {
                type: 'line',
                name: 'Resolved',
                color: '#8AD554',
                data: resolvedLine,
                yAxis: 0,
            },
            {
                type: 'line',
                name: 'Created',
                color: '#FF3D64',
                data: createdLine,
                yAxis: 0,
            },
            {
                type: 'line',
                name: 'Average',
                color: '#4DA2F1',
                data: trends,
                yAxis: 1,
                marker: {
                    enabled: false,
                },
            },
        ],
    },
    config: {
        hideHolidays: false,
        normalizeDiv: false,
        normalizeSub: false,
        hideHolidaysBands: true,
    },
    libraryConfig: {
        chart: {
            animation: false,
            events: {
                load: function (_event) {
                    const rect = getDividerRect(this);
                    this.renderer
                        .rect(rect.x, rect.y, rect.width, rect.height)
                        .addClass('highcharts-axis-grid-divider')
                        .attr({
                            fill: 'var(--g-color-base-background)',
                            zIndex: 8,
                        })
                        .add();
                },
                redraw: function (_event) {
                    const rect = getDividerRect(this);

                    const element = this.container.querySelector(
                        '.highcharts-axis-grid-divider',
                    ) as SVGElement | null;
                    if (element) {
                        element.setAttribute('x', String(rect.x));
                        element.setAttribute('y', String(rect.y));
                        element.setAttribute('width', String(rect.width));
                        element.setAttribute('height', String(rect.height));
                    }
                },
            },
        },
        xAxis: {
            type: 'datetime',
            minPadding: 0.05,
            maxPadding: 0.05,
        },
        yAxis: [
            {
                height: '70%',
                labels: {
                    x: -14,
                },
                offset: 0,
                lineWidth: 1,
            },
            {
                height: '20%',
                top: '80%',
                labels: {
                    x: -14,
                },
                offset: 0,
                lineWidth: 1,
            },
        ],
        plotOptions: {
            series: {
                states: {
                    inactive: {
                        opacity: 0.5,
                    },
                },
            },
            arearange: {
                showInLegend: false,
                enableMouseTracking: false,
                lineWidth: 0,
                marker: {
                    enabled: false,
                },
                zoneAxis: 'x',
            },
            line: {
                lineWidth: 1,
                marker: {
                    enabled: true,
                    symbol: 'circle',
                },
                states: {
                    hover: {
                        lineWidth: 1,
                        lineWidthPlus: 0,
                    },
                },
            },
        },
        legend: {
            enabled: false,
        },
    },
};
