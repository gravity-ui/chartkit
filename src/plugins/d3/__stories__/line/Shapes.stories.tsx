import React from 'react';
import {StoryObj} from '@storybook/react';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {D3Plugin} from '../..';
import {ChartKitWidgetData, LineSeriesData} from '../../../../types';
import {ChartKit} from '../../../../components/ChartKit';
import nintendoGames from '../../examples/nintendoGames';
import {HighchartsPlugin} from '../../../highcharts';

enum LineShapeType {
    Solid = 'Solid',
    ShortDash = 'ShortDash',
    ShortDot = 'ShortDot',
    ShortDashDot = 'ShortDashDot',
    ShortDashDotDot = 'ShortDashDotDot',
    Dot = 'Dot',
    Dash = 'Dash',
    LongDash = 'LongDash',
    DashDot = 'DashDot',
    LongDashDot = 'LongDashDot',
    LongDashDotDot = 'LongDashDotDot',
}
const SHAPES_ORDER = {
    [LineShapeType.Solid]: 1,
    [LineShapeType.Dash]: 2,
    [LineShapeType.Dot]: 3,
    [LineShapeType.ShortDashDot]: 4,
    [LineShapeType.LongDash]: 5,
    [LineShapeType.LongDashDot]: 6,
    [LineShapeType.ShortDot]: 7,
    [LineShapeType.LongDashDotDot]: 8,
    [LineShapeType.ShortDash]: 9,
    [LineShapeType.DashDot]: 10,
    [LineShapeType.ShortDashDotDot]: 11,
};

const selectShapes = (): LineShapeType[] => Object.values(LineShapeType);
const getServerShapesOrder = () => selectShapes().sort((a, b) => SHAPES_ORDER[a] - SHAPES_ORDER[b]);

const SHAPES_IN_ORDER = getServerShapesOrder();

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

    data.series.data.forEach((graph, i) => {
        // @ts-ignore
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
