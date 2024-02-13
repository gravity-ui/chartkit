import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {action} from '@storybook/addon-actions';
import {StoryObj} from '@storybook/react';
import {descending, groups, sort} from 'd3';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitWidgetData} from '../../../../types';
import {HighchartsPlugin} from '../../../highcharts';
import nintendoGames from '../../examples/nintendoGames';

function prepareData(): ChartKitWidgetData {
    const gamesByPlatform = groups(nintendoGames, (item) => item.platform);
    const seriesData = gamesByPlatform.map(([platform, games]) => ({
        name: platform,
        value: games.length,
        label: `${platform} (${games.length})`,
    }));

    return {
        series: {
            data: [
                {
                    type: 'pie',
                    data: sort(seriesData, (d1, d2) => descending(d1.value, d2.value)),
                    dataLabels: {
                        enabled: true,
                        connectorCurve: 'basic',
                    },
                },
            ],
        },
        legend: {enabled: true},
        chart: {
            events: {
                click: action('chart.events.click'),
            },
        },
    };
}

const ChartStory = ({data}: {data: ChartKitWidgetData}) => {
    const [shown, setShown] = React.useState(false);

    if (!shown) {
        settings.set({plugins: [D3Plugin, HighchartsPlugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <>
            <div
                style={{
                    height: '80vh',
                    width: '100%',
                }}
            >
                <ChartKit type="d3" data={{...data, title: {text: 'D3'}}} />
            </div>
            <div
                style={{
                    height: '80vh',
                    width: '100%',
                    marginTop: 20,
                }}
            >
                <ChartKit
                    type="highcharts"
                    data={{
                        data: {
                            graphs: [
                                {
                                    type: 'pie',
                                    data: data.series.data[0].data.map((d: any) => ({
                                        ...d,
                                        y: d.value,
                                    })),
                                },
                            ],
                        },
                        config: {},
                        libraryConfig: {
                            title: {text: 'Highcharts'},
                            legend: {enabled: true},
                        },
                    }}
                />
            </div>
        </>
    );
};

export const PlaygroundPieChartStory: StoryObj<typeof ChartStory> = {
    name: 'Playground',
    args: {
        data: prepareData(),
    },
    argTypes: {
        data: {
            control: 'object',
        },
    },
};

export default {
    title: 'Plugins/D3/Pie',
    component: ChartStory,
};
