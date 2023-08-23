import {HighchartsWidgetData} from '../types';

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                name: 'Number of requests',
                tooltip: {
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                },
                dataLabels: {
                    format: null,
                    chartKitFormatting: true,
                    chartKitPrecision: 0,
                    chartKitPrefix: '',
                    chartKitPostfix: '',
                    chartKitLabelMode: 'absolute',
                    chartKitFormat: 'number',
                    chartKitShowRankDelimiter: true,
                },
                data: [
                    {name: 'Furniture', y: 14344, label: 14344},
                    {name: 'Domestic chemistry', y: 14244, label: 14244},
                    {name: 'Household goods', y: 14181, label: 14181},
                ],
            },
        ],
        categories: ['Furniture', 'Domestic chemistry', 'Household goods'],
        totals: 42769,
    },
    config: {
        showPercentInTooltip: true,
    },
    libraryConfig: {
        chart: {
            type: 'pie',
        },
        plotOptions: {
            pie: {
                innerSize: '50%',
            },
        },
    },
};
