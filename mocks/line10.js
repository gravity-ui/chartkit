const line10 = {
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
                visible: true,
                data: [25, 52, 89, 72, 39, 49, 82, 59, 36, 5],
            },
            {
                id: '1',
                name: 'Serie 2',
                color: '#6e8188',
                visible: true,
                data: [37, 6, 51, 10, 65, 35, 72, 0, 94, 54],
            },
            {
                id: '2',
                name: 'Serie 3',
                color: '#e21576',
                visible: true,
                data: [26, 54, 15, 40, 43, 18, 65, 46, 51, 33],
            },
        ],
    },
    timings: {
        configResolving: 1,
        dataFetching: 1,
        jsExecution: 1,
    },
    sources: {
        data: {
            program: 'some',
        },
    },
    libraryConfig: {
        chart: {
            type: 'line',
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
        settings: {
            adaptive: true,
        },
        tooltip: {
            enabled: true,
            total: true,
            boundClassName: '.wrapper',
            tracking: 'sticky',
            className: 'chartkit-theme_common',
        },
        legend: {},
        processing: {},
    },
    config: {},
    params: {},
    controls: null,
};

export default line10;
