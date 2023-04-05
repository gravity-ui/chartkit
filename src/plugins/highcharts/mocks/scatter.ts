import type {HighchartsWidgetData} from '../types';

export const data: HighchartsWidgetData = {
    data: {
        graphs: [
            {
                data: [
                    {
                        xLabel: '<b>Bold</b>&nbsp;<i>Italic</i>',
                        x: 2,
                        y: 1,
                    },
                ],
            },
        ],
    },
    config: {},
    libraryConfig: {
        chart: {type: 'scatter'},
        plotOptions: {
            scatter: {
                tooltip: {
                    headerFormat: '',
                    pointFormat: 'Label: {point.xLabel}',
                },
            },
        },
    },
};
