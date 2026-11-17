import type {YagrWidgetData} from '../../types';

export const LABELED_DATA: YagrWidgetData = {
    data: {
        timeline: [Date.UTC(2026, 0, 1), Date.UTC(2026, 0, 2), Date.UTC(2026, 0, 3)],
        graphs: [
            {
                id: 'revenue',
                name: 'Revenue',
                type: 'line',
                data: [],
                _data: [
                    {value: 10, label: 'Plan'},
                    {value: 20, label: 'Actual'},
                    {value: 15, label: 'Total'},
                ],
            },
        ],
    },
    libraryConfig: {scales: {y: {min: 0, max: 40}}},
};
