import {HighchartsWidgetData} from '../../types';

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                title: 'Central',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                data: [
                    {
                        y: 163798.70024430752,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 167028.80030867457,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 170420.6004266739,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                ],
                legendTitle: 'Central',
                drillDownFilterValue: 'Central',
                connectNulls: false,
                yAxis: 0,
                colorValue: 'Central',
                shapeValue: 'Profit',
                custom: {},
                color: '#4DA2F1',
            },
            {
                title: 'East',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                data: [
                    {
                        y: 208293.70054268837,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 205518.80070078373,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 264979.80019688606,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                ],
                legendTitle: 'East',
                drillDownFilterValue: 'East',
                connectNulls: false,
                yAxis: 0,
                colorValue: 'East',
                shapeValue: 'Profit',
                custom: {},
                color: '#FF3D64',
            },
            {
                title: 'South',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                data: [
                    {
                        y: 117300.00069212914,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 125653.1994549036,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 148775.5996557474,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                ],
                legendTitle: 'South',
                drillDownFilterValue: 'South',
                connectNulls: false,
                yAxis: 0,
                colorValue: 'South',
                shapeValue: 'Profit',
                custom: {},
                color: '#8AD554',
            },
            {
                title: 'West',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                data: [
                    {
                        y: 252617.00065851212,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 220856.3998889923,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                    {
                        y: 251998.89954137802,
                        dataLabels: {
                            enabled: false,
                        },
                    },
                ],
                legendTitle: 'West',
                drillDownFilterValue: 'West',
                connectNulls: false,
                yAxis: 0,
                colorValue: 'West',
                shapeValue: 'Profit',
                custom: {},
                color: '#FFC636',
            },
        ],
        categories: ['Furniture', 'Office Supplies', 'Technology'],
    },
    config: {
        withoutLineLimit: true,
        hideHolidaysBands: true,
        enableSum: true,
    },
    libraryConfig: {
        chart: {
            type: 'bar',
            zoomType: 'xy',
        },
        xAxis: {
            endOnTick: false,
            title: {
                text: null,
            },
            type: 'linear',
            labels: {
                enabled: true,
            },
        },
        yAxis: {
            opposite: false,
            labels: {
                y: 3,
                enabled: true,
            },
            title: {
                text: null,
            },
            type: 'linear',
        },
        tooltip: {},
        plotOptions: {
            bar: {
                stacking: 'normal',
            },
            column: {
                dataGrouping: {
                    enabled: false,
                },
                maxPointWidth: 50,
            },
            series: {
                dataGrouping: {
                    enabled: false,
                },
                dataLabels: {
                    allowOverlap: false,
                },
            },
        },
    },
};
