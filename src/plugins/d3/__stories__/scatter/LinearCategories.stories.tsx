import React from 'react';
import random from 'lodash/random';
import {Meta, Story} from '@storybook/react';
import {withKnobs, select, radios, text} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitRef} from '../../../../types';
import type {
    ChartKitWidgetAxis,
    ChartKitWidgetData,
    ScatterSeries,
    ScatterSeriesData,
} from '../../../../types/widget-data';
import {D3Plugin} from '../..';
import penguins from '../penguins.json';

const shapeScatterSeriesData = (args: {data: Record<string, any>[]; groupBy: string; map: any}) => {
    const {data, groupBy, map} = args;

    return data.reduce<Record<string, ScatterSeriesData[]>>((acc, d) => {
        const seriesName = d[groupBy] as string;

        if (!seriesName) {
            return acc;
        }

        if (!acc[seriesName]) {
            acc[seriesName] = [];
        }

        acc[seriesName].push({
            x: d[map.x],
            y: d[map.y],
            radius: random(3, 6),
            ...(map.category && {category: d[map.category]}),
        });

        return acc;
    }, {});
};

const shapeScatterSeries = (data: Record<string, ScatterSeriesData[]>) => {
    return Object.keys(data).reduce<ScatterSeries[]>((acc, name) => {
        acc.push({
            type: 'scatter',
            data: data[name],
            name,
        });

        return acc;
    }, []);
};

const shapeScatterChartData = (
    series: ScatterSeries[],
    categoriesType: 'none' | 'x' | 'y',
    categories?: string[],
): ChartKitWidgetData => {
    let xAxis: ChartKitWidgetAxis = {
        title: {
            text: text('X axis title', ''),
        },
    };

    let yAxis: ChartKitWidgetAxis = {
        title: {
            text: text('Y axis title', ''),
        },
    };

    if (categories && categoriesType === 'x') {
        xAxis = {
            ...xAxis,
            type: 'category',
            categories,
        };
    }

    if (categories && categoriesType === 'y') {
        yAxis = {
            ...yAxis,
            type: 'category',
            categories,
        };
    }

    return {
        series: {
            data: series,
        },
        xAxis,
        yAxis: [yAxis],
        title: {
            text: text('title', 'Chart title'),
        },
    };
};

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const x = select(
        'x',
        ['culmen_length_mm', 'culmen_depth_mm', 'flipper_length_mm', 'body_mass_g'],
        'culmen_length_mm',
    );
    const y = select(
        'y',
        ['culmen_length_mm', 'culmen_depth_mm', 'flipper_length_mm', 'body_mass_g'],
        'culmen_depth_mm',
    );

    const groupBy = select('groupBy', ['species', 'island', 'sex'], 'species');
    const categoriesType = radios('categoriesType', {none: 'none', x: 'x', y: 'y'}, 'none');
    const category =
        categoriesType === 'none'
            ? undefined
            : select('category', ['species', 'island', 'sex'], 'island');
    let categories: string[] | undefined;

    if (categoriesType !== 'none' && category) {
        categories = penguins.reduce<string[]>((acc, p) => {
            const cerrentCategory = p[category];

            if (typeof cerrentCategory === 'string' && !acc.includes(cerrentCategory)) {
                acc.push(cerrentCategory);
            }

            return acc;
        }, []);
    }
    const shapedScatterSeriesData = shapeScatterSeriesData({
        data: penguins,
        groupBy,
        map: {x, y, category},
    });
    const shapedScatterSeries = shapeScatterSeries(shapedScatterSeriesData);
    const data = shapeScatterChartData(shapedScatterSeries, categoriesType, categories);

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div style={{height: '400px', width: '100%'}}>
            <ChartKit ref={chartkitRef} type="d3" data={data} />
        </div>
    );
};

export const LinearAndCategories = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Scatter',
    decorators: [withKnobs],
};

export default meta;
