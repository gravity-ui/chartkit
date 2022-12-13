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
                        x: 2014,
                    },
                    {
                        y: 2472,
                        x: 2015,
                    },
                    {
                        y: 5248,
                        x: 2016,
                    },
                    {
                        y: 7787,
                        x: 2017,
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
                        x: 2014,
                    },
                    {
                        y: -2777,
                        x: 2015,
                    },
                    {
                        y: 1880,
                        x: 2016,
                    },
                    {
                        y: -616,
                        x: 2017,
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
