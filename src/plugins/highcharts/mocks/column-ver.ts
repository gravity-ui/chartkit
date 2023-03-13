import {HighchartsWidgetData} from '../types';

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                data: [
                    {
                        y: 50.55,
                        color: 'rgb(255, 61, 9)',
                    },
                    {
                        y: 80.45,
                        color: 'rgb(255, 65, 9)',
                    },
                    {
                        y: 100.34,
                        color: 'rgb(255, 83, 9)',
                    },
                ],
                name: 'Profit',
            },
            {
                data: [
                    {
                        y: 350.65,
                        color: 'rgb(208, 189, 48)',
                    },
                    {
                        y: 119.82,
                        color: 'rgb(255, 95, 88)',
                    },
                    {
                        y: 452.15,
                        color: 'rgb(84, 165, 32)',
                    },
                ],
                name: 'Sales',
            },
        ],
        categories: ['Furniture', 'Office Supplies', 'Technology'],
    },
    config: {
        enableSum: true,
        precision: 2,
    },
    libraryConfig: {
        chart: {
            type: 'column',
        },
        legend: {
            title: {
                text: 'Measure Values',
            },
            enabled: true,
        },
        colorAxis: {
            startOnTick: false,
            endOnTick: false,
            min: 50.55,
            max: 452.72057380654326,
            stops: [
                [0, 'rgb(255, 61, 100)'],
                [0.5, 'rgb(255, 198, 54)'],
                [1, 'rgb(84, 165, 32)'],
            ],
        },
        plotOptions: {
            column: {
                maxPointWidth: 50,
            },
        },
        enableSum: true,
    },
};
