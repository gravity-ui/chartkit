import React from 'react';

import {Button} from '@gravity-ui/uikit';
import {StoryObj} from '@storybook/react';

import {D3Plugin} from '../..';
import {ChartKit} from '../../../../components/ChartKit';
import {settings} from '../../../../libs';
import {ChartKitWidgetData, LineSeriesData} from '../../../../types';
import {HighchartsPlugin} from '../../../highcharts';
import nintendoGames from '../../examples/nintendoGames';

function prepareData(): ChartKitWidgetData {
    const games = nintendoGames.filter((d) => {
        return d.date && d.user_score;
    });

    const byGenre = (genre: string) => {
        return games
            .filter((d) => d.genres.includes(genre))
            .map((d) => {
                return {
                    x: d.date,
                    y: d.user_score,
                    label: d.title,
                };
            }) as LineSeriesData[];
    };

    return {
        series: {
            options: {
                line: {
                    lineWidth: 2,
                },
            },
            data: [
                {
                    name: '3D',
                    type: 'line',
                    data: byGenre('3D'),
                    dataLabels: {
                        enabled: true,
                    },
                },
                {
                    name: '2D',
                    type: 'line',
                    data: byGenre('2D'),
                    dataLabels: {
                        enabled: true,
                    },
                },
                {
                    name: 'Strategy',
                    type: 'line',
                    data: byGenre('Strategy'),
                    dataLabels: {
                        enabled: true,
                    },
                },
                {
                    name: 'Shooter',
                    type: 'line',
                    data: byGenre('Shooter'),
                    dataLabels: {
                        enabled: true,
                    },
                },
            ],
        },
        xAxis: {
            type: 'datetime',
            title: {
                text: 'Release date',
            },
        },
        yAxis: [
            {
                title: {text: 'User score'},
                labels: {
                    enabled: true,
                },
                ticks: {
                    pixelInterval: 120,
                },
            },
        ],
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
                            graphs: data.series.data,
                        },
                        config: {},
                        libraryConfig: {
                            title: {text: 'Highcharts'},
                            xAxis: {
                                type: 'datetime',
                            },
                        },
                    }}
                />
            </div>
        </>
    );
};

export const PlaygroundLineChartStory: StoryObj<typeof ChartStory> = {
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
    title: 'Plugins/D3/Line',
    component: ChartStory,
};
