import type {AreaSeriesOptions, RawSerieData, YagrWidgetData} from '../../types';

export const line10: YagrWidgetData = {
    data: {
        timeline: [
            1636838612441, 1636925012441, 1637011412441, 1637097812441, 1637184212441,
            1637270612441, 1637357012441, 1637443412441, 1637529812441, 1637616212441,
        ],
        graphs: [
            {
                id: '0',
                name: 'Serie 1',
                color: '#6c59c2',
                data: [45, 52, 89, 72, 39, 49, 82, 59, 36, 5],
            },
            {
                id: '1',
                name: 'Serie 2',
                color: '#6e8188',
                data: [37, 6, 51, 10, 65, 35, 72, 0, 94, 54],
            },
            {
                id: '2',
                name: 'Serie 3',
                color: '#e21576',
                data: [26, 54, 15, 40, 43, 18, 65, 46, 51, 33],
            },
        ],
    },
    libraryConfig: {
        chart: {
            series: {
                type: 'line',
            },
            select: {
                zoom: false,
            },
        },
        title: {
            text: 'line: random 10 pts',
        },
        axes: {
            x: {},
        },
        scales: {
            x: {},
            y: {
                type: 'linear',
                range: 'nice',
            },
        },
        cursor: {
            x: {
                visible: true,
                style: 'solid 2px rgba(230, 2, 7, 0.3)',
            },
        },
        tooltip: {
            show: true,
            tracking: 'sticky',
        },
        legend: {},
        processing: {},
    },
};

export const getNewConfig = () => {
    const startPoint = (Math.random() * 10 ** 5) >> 0; // eslint-disable-line no-bitwise
    return {
        ...line10,
        libraryConfig: {
            ...line10.libraryConfig,
            title: {
                text: 'line: random 100 pts',
            },
        },
        data: {
            timeline: new Array(100).fill(0).map((_, i) => {
                return startPoint + i * 1000;
            }),
            graphs: line10.data.graphs.map((graph) => {
                return {
                    ...graph,
                    data: new Array(100).fill(0).map(() => {
                        return (Math.random() * 100) >> 0; // eslint-disable-line no-bitwise
                    }),
                };
            }),
        },
    };
};

// Grafana classic colors palette
const colors = [
    '#7EB26D', // 0: pale green
    '#EAB839', // 1: mustard
    '#6ED0E0', // 2: light blue
    '#EF843C', // 3: orange
    '#E24D42', // 4: red
    '#1F78C1', // 5: ocean
    '#BA43A9', // 6: purple
    '#705DA0', // 7: violet
    '#508642', // 8: dark green
    '#CCA300', // 9: dark sand
];

function colorHexToRGBA(htmlColor: string, opacity: number) {
    const COLOR_REGEX = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/;
    const arrRGB = htmlColor.match(COLOR_REGEX);
    if (arrRGB === null) {
        throw new Error(
            'Invalid color passed, the color should be in the html format. Example: #ff0033',
        );
    }
    const red = parseInt(arrRGB[1], 16);
    const green = parseInt(arrRGB[2], 16);
    const blue = parseInt(arrRGB[3], 16);
    return `rgba(${[red, green, blue, opacity].join(',')})`;
}

const graphs: RawSerieData<AreaSeriesOptions>[] = [
    {
        id: '0',
        name: 'Serie 1',
        type: 'area',
        color: colorHexToRGBA(colors[0], 0.1),
        lineColor: colors[0],
        legendColorKey: 'lineColor',
        data: [45, 52, 89, 72, 39, 49, 82, 59, 36, 5],
    },
    {
        id: '1',
        name: 'Serie 2',
        type: 'area',
        color: colorHexToRGBA(colors[1], 0.1),
        lineColor: colors[1],
        legendColorKey: 'lineColor',
        data: [37, 6, 51, 10, 65, 35, 72, 0, 94, 54],
    },
    {
        id: '2',
        name: 'Serie 3',
        type: 'area',
        color: colorHexToRGBA(colors[2], 0.1),
        lineColor: colors[2],
        legendColorKey: 'lineColor',
        data: [26, 54, 15, 40, 43, 18, 65, 46, 51, 33],
    },
];

export const line10WithGrafanaStyle: YagrWidgetData = {
    data: {
        timeline: [
            1636838612441, 1636925012441, 1637011412441, 1637097812441, 1637184212441,
            1637270612441, 1637357012441, 1637443412441, 1637529812441, 1637616212441,
        ],
        graphs,
    },
    libraryConfig: {
        chart: {
            series: {
                type: 'area',
                lineWidth: 1.5,
            },
            select: {
                zoom: false,
            },
        },
        title: {
            text: 'line: random 10 pts',
        },
        axes: {
            x: {},
        },
        scales: {
            x: {},
            y: {
                type: 'linear',
                range: 'nice',
            },
        },
        cursor: {
            x: {
                visible: true,
                style: 'solid 2px rgba(230, 2, 7, 0.3)',
            },
        },
        tooltip: {
            show: true,
            tracking: 'sticky',
        },
        legend: {
            show: true,
        },
        processing: {},
    },
};
