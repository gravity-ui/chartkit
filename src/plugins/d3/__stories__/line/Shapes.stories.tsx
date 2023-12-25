import React from 'react';
import {StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {D3Plugin} from '../..';
import {ChartKitWidgetData, LineSeriesData, LineSeries, DashStyle} from '../../../../types';
import {ChartKit} from '../../../../components/ChartKit';
import nintendoGames from '../../examples/nintendoGames';
import {HighchartsPlugin} from '../../../highcharts';

const SHAPES = {
    [DashStyle.Solid]: 1,
    [DashStyle.Dash]: 2,
    [DashStyle.Dot]: 3,
    [DashStyle.ShortDashDot]: 4,
    [DashStyle.LongDash]: 5,
    [DashStyle.LongDashDot]: 6,
    [DashStyle.ShortDot]: 7,
    [DashStyle.LongDashDotDot]: 8,
    [DashStyle.ShortDash]: 9,
    [DashStyle.DashDot]: 10,
    [DashStyle.ShortDashDotDot]: 11,
};

const selectShapes = (): DashStyle[] => Object.values(DashStyle);
const getShapesOrder = () => selectShapes().sort((a, b) => SHAPES[a] - SHAPES[b]);

const SHAPES_IN_ORDER = getShapesOrder();

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

    (data.series.data as LineSeries[]).forEach((graph, i) => {
        graph.dashStyle = SHAPES_IN_ORDER[i % SHAPES_IN_ORDER.length];
    });

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

export const ShapesLineChartStory: StoryObj<typeof ChartStory> = {
    name: 'Shapes',
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
