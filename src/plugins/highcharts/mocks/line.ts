import type {HighchartsWidgetData} from '../types';

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                title: 'Profit',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 2,
                },
                data: [
                    {
                        y: 18451.2728,
                        dataLabels: {
                            enabled: false,
                        },
                        label: '',
                    },
                    {
                        y: 122490.80080000011,
                        dataLabels: {
                            enabled: false,
                        },
                        label: '',
                    },
                    {
                        y: 145454.9480999999,
                        dataLabels: {
                            enabled: false,
                        },
                        label: '',
                    },
                ],
                legendTitle: 'Profit',
                colorKey: 'Profit',
                colorGuid: null,
                connectNulls: false,
                yAxis: 0,
                colorValue: 'Profit',
                color: '#4DA2F1',
                dashStyle: 'Solid',
                name: 'Profit',
            },
            {
                title: 'Sales',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 2,
                },
                data: [
                    {
                        y: 741999.7952999998,
                        dataLabels: {
                            enabled: false,
                        },
                        label: '',
                    },
                    {
                        y: 719047.0320000029,
                        dataLabels: {
                            enabled: false,
                        },
                        label: '',
                    },
                    {
                        y: 836154.0329999966,
                        dataLabels: {
                            enabled: false,
                        },
                        label: '',
                    },
                ],
                legendTitle: 'Sales',
                colorKey: 'Sales',
                colorGuid: null,
                connectNulls: false,
                yAxis: 0,
                colorValue: 'Sales',
                color: '#FF3D64',
                dashStyle: 'Solid',
                name: 'Sales',
            },
        ],
        categories: ['Furniture', 'Office Supplies', 'Technology'],
    },
    config: {
        precision: 2,
        hideHolidaysBands: true,
        enableSum: true,
        hideHolidays: false,
        normalizeDiv: false,
        normalizeSub: false,
        manageTooltipConfig: (config) => {
            config.lines.forEach((line, index) => {
                line.commentText = `Some comment ${index + 1}`;
            });

            return config;
        },
    },
    libraryConfig: {
        chart: {
            type: 'line',
            zoomType: 'xy',
        },
        legend: {
            symbolWidth: 38,
        },
        xAxis: {
            endOnTick: false,
        },
        yAxis: {
            opposite: false,
            labels: {
                y: 3,
            },
            type: 'linear',
        },
        tooltip: {},
        plotOptions: {
            series: {
                dataGrouping: {
                    enabled: false,
                },
                dataLabels: {
                    allowOverlap: false,
                },
            },
        },
        axesFormatting: {
            xAxis: [],
            yAxis: [],
        },
        enableSum: true,
    },
};
