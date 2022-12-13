import {HighchartsWidgetData} from '../../types';

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                title: 'Appliances',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                data: [
                    {
                        y: 2420,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2014,
                        label: '',
                    },
                    {
                        y: 2472,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2015,
                        label: '',
                    },
                    {
                        y: 5248,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2016,
                        label: '',
                    },
                    {
                        y: 7787,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2017,
                        label: '',
                    },
                ],
                legendTitle: 'Appliances',
                connectNulls: false,
                yAxis: 0,
                color: '#FF3D64',
            },
            {
                title: 'Bookcases',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                data: [
                    {
                        y: -363,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2014,
                        label: '',
                    },
                    {
                        y: -2777,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2015,
                        label: '',
                    },
                    {
                        y: 1880,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2016,
                        label: '',
                    },
                    {
                        y: -616,
                        dataLabels: {
                            enabled: false,
                        },
                        x: 2017,
                        label: '',
                    },
                ],
                legendTitle: 'Bookcases',
                connectNulls: false,
                yAxis: 0,
                color: '#8AD554',
            },
        ],
        categories: ['2014', '2015', '2016', '2017'],
    },
    config: {
        withoutLineLimit: true,
        hideHolidaysBands: true,
        enableSum: true,
    },
    libraryConfig: {
        chart: {
            type: 'area',
            zoomType: 'x',
        },
        xAxis: {
            endOnTick: false,
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
            type: 'linear',
        },
        plotOptions: {
            area: {
                stacking: 'normal',
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
