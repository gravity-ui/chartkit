import React from 'react';

import type {StoryObj} from '@storybook/react';
import {groups} from 'd3';

import {ChartKit} from '../../../../components/ChartKit';
import {Loader} from '../../../../components/Loader/Loader';
import {settings} from '../../../../libs';
import type {BarXSeriesData, ChartKitWidgetData} from '../../../../types';
import {ExampleWrapper} from '../../examples/ExampleWrapper';
import nintendoGames from '../../examples/nintendoGames';
import {D3Plugin} from '../../index';
import {getContinuesColorFn} from '../utils/get-continues-color-fn';

const BarXWithContinuousLegend = () => {
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        settings.set({plugins: [D3Plugin]});
        setLoading(false);
    }, []);

    if (loading) {
        return <Loader />;
    }

    const colors = ['rgb(255, 61, 100)', 'rgb(255, 198, 54)', 'rgb(84, 165, 32)'];
    const stops = [0, 0.5, 1];

    const gamesByPlatform = groups(nintendoGames, (item) => item.platform);
    const categories = gamesByPlatform.map(([platform, _games]) => platform);
    const data: BarXSeriesData[] = gamesByPlatform.map(([platform, games], index) => ({
        x: index,
        y: games.length,
        label: `${platform}(${games.length})`,
    }));
    const getColor = getContinuesColorFn({colors, stops, values: data.map((d) => Number(d.y))});
    data.forEach((d) => {
        d.color = getColor(Number(d.y));
    });

    const widgetData: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'bar-x',
                    name: 'Series 1',
                    data,
                },
            ],
        },
        xAxis: {
            type: 'category',
            categories,
        },
        title: {text: 'Bar-x with continues color'},
        legend: {
            enabled: true,
            type: 'continuous',
            title: {text: 'Games by platform'},
            colorScale: {
                colors: colors,
                stops,
            },
        },
    };

    return (
        <ExampleWrapper styles={{minHeight: '400px'}}>
            <ChartKit type="d3" data={widgetData} />
        </ExampleWrapper>
    );
};

export const BarXWithContinuousLegendStory: StoryObj<typeof BarXWithContinuousLegend> = {
    name: 'Continuous legend',
};

export default {
    title: 'Plugins/D3/Bar-x',
    component: BarXWithContinuousLegend,
};
