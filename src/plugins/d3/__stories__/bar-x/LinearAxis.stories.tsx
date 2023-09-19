import React from 'react';
import {Meta, Story} from '@storybook/react';
import {withKnobs, object} from '@storybook/addon-knobs';
import {Button} from '@gravity-ui/uikit';
import {settings} from '../../../../libs';
import {ChartKit} from '../../../../components/ChartKit';
import type {ChartKitRef} from '../../../../types';
import type {ChartKitWidgetData} from '../../../../types/widget-data';
import {D3Plugin} from '../..';

const Template: Story = () => {
    const [shown, setShown] = React.useState(false);
    const chartkitRef = React.useRef<ChartKitRef>();
    const data: ChartKitWidgetData = {
        series: {
            data: [
                {
                    type: 'bar-x',
                    visible: true,
                    data: [
                        {
                            y: 1,
                            x: -1523,
                        },
                        {
                            y: 1,
                            x: -1000,
                        },
                        {
                            y: 1,
                            x: -660,
                        },
                        {
                            y: 1,
                            x: 800,
                        },
                        {
                            y: 1,
                            x: 836,
                        },
                        {
                            y: 1,
                            x: 843,
                        },
                        {
                            y: 1,
                            x: 885,
                        },
                        {
                            y: 1,
                            x: 1066,
                        },
                        {
                            y: 1,
                            x: 1143,
                        },
                        {
                            y: 1,
                            x: 1278,
                        },
                        {
                            y: 1,
                            x: 1350,
                        },
                        {
                            y: 1,
                            x: 1492,
                        },
                        {
                            y: 1,
                            x: 1499,
                        },
                        {
                            y: 1,
                            x: 1581,
                        },
                        {
                            y: 1,
                            x: 1769,
                        },
                        {
                            y: 1,
                            x: 1776,
                        },
                        {
                            y: 1,
                            x: 1804,
                        },
                        {
                            y: 1,
                            x: 1806,
                        },
                        {
                            y: 2,
                            x: 1810,
                        },
                        {
                            y: 1,
                            x: 1811,
                        },
                        {
                            y: 1,
                            x: 1816,
                        },
                        {
                            y: 2,
                            x: 1821,
                        },
                        {
                            y: 1,
                            x: 1822,
                        },
                        {
                            y: 1,
                            x: 1825,
                        },
                        {
                            y: 1,
                            x: 1828,
                        },
                        {
                            y: 2,
                            x: 1830,
                        },
                        {
                            y: 1,
                            x: 1838,
                        },
                        {
                            y: 1,
                            x: 1841,
                        },
                        {
                            y: 1,
                            x: 1844,
                        },
                        {
                            y: 1,
                            x: 1847,
                        },
                        {
                            y: 2,
                            x: 1861,
                        },
                        {
                            y: 2,
                            x: 1867,
                        },
                        {
                            y: 1,
                            x: 1878,
                        },
                        {
                            y: 1,
                            x: 1901,
                        },
                        {
                            y: 1,
                            x: 1902,
                        },
                        {
                            y: 1,
                            x: 1903,
                        },
                        {
                            y: 1,
                            x: 1905,
                        },
                        {
                            y: 1,
                            x: 1906,
                        },
                        {
                            y: 1,
                            x: 1907,
                        },
                        {
                            y: 1,
                            x: 1908,
                        },
                        {
                            y: 2,
                            x: 1910,
                        },
                        {
                            y: 1,
                            x: 1912,
                        },
                        {
                            y: 1,
                            x: 1917,
                        },
                        {
                            y: 4,
                            x: 1918,
                        },
                        {
                            y: 1,
                            x: 1919,
                        },
                        {
                            y: 2,
                            x: 1921,
                        },
                        {
                            y: 1,
                            x: 1922,
                        },
                        {
                            y: 1,
                            x: 1923,
                        },
                        {
                            y: 1,
                            x: 1929,
                        },
                        {
                            y: 1,
                            x: 1932,
                        },
                        {
                            y: 1,
                            x: 1941,
                        },
                        {
                            y: 1,
                            x: 1944,
                        },
                        {
                            y: 2,
                            x: 1945,
                        },
                        {
                            y: 2,
                            x: 1946,
                        },
                        {
                            y: 1,
                            x: 1947,
                        },
                        {
                            y: 4,
                            x: 1948,
                        },
                        {
                            y: 2,
                            x: 1951,
                        },
                        {
                            y: 1,
                            x: 1953,
                        },
                        {
                            y: 1,
                            x: 1955,
                        },
                        {
                            y: 1,
                            x: 1956,
                        },
                        {
                            y: 2,
                            x: 1957,
                        },
                        {
                            y: 1,
                            x: 1958,
                        },
                        {
                            y: 4,
                            x: 1960,
                        },
                        {
                            y: 3,
                            x: 1961,
                        },
                        {
                            y: 4,
                            x: 1962,
                        },
                        {
                            y: 1,
                            x: 1963,
                        },
                        {
                            y: 2,
                            x: 1964,
                        },
                        {
                            y: 3,
                            x: 1965,
                        },
                        {
                            y: 3,
                            x: 1966,
                        },
                        {
                            y: 4,
                            x: 1968,
                        },
                        {
                            y: 2,
                            x: 1970,
                        },
                        {
                            y: 2,
                            x: 1971,
                        },
                        {
                            y: 1,
                            x: 1973,
                        },
                        {
                            y: 2,
                            x: 1974,
                        },
                        {
                            y: 5,
                            x: 1975,
                        },
                        {
                            y: 1,
                            x: 1976,
                        },
                        {
                            y: 1,
                            x: 1977,
                        },
                        {
                            y: 3,
                            x: 1978,
                        },
                        {
                            y: 2,
                            x: 1979,
                        },
                        {
                            y: 2,
                            x: 1980,
                        },
                        {
                            y: 2,
                            x: 1981,
                        },
                        {
                            y: 1,
                            x: 1983,
                        },
                        {
                            y: 1,
                            x: 1984,
                        },
                        {
                            y: 2,
                            x: 1990,
                        },
                        {
                            y: 5,
                            x: 1991,
                        },
                        {
                            y: 1,
                            x: 1992,
                        },
                        {
                            y: 2,
                            x: 1993,
                        },
                        {
                            y: 1,
                            x: 1994,
                        },
                    ],
                    name: 'AB',
                },
            ],
        },
        title: {text: 'Linear axis'},
        xAxis: {
            min: 0,
            type: 'linear',
            labels: {enabled: true},
        },
        yAxis: [
            {
                type: 'linear',
                labels: {enabled: true},
                min: 0,
                ticks: {
                    pixelInterval: 100,
                },
            },
        ],
        legend: {enabled: true},
        tooltip: {enabled: true},
    };

    if (!shown) {
        settings.set({plugins: [D3Plugin]});
        return <Button onClick={() => setShown(true)}>Show chart</Button>;
    }

    return (
        <div
            style={{
                height: '80vh',
                width: '100%',
            }}
        >
            <ChartKit ref={chartkitRef} type="d3" data={object<ChartKitWidgetData>('data', data)} />
        </div>
    );
};

export const LinearXAxis = Template.bind({});

const meta: Meta = {
    title: 'Plugins/D3/Bar-X',
    decorators: [withKnobs],
};

export default meta;
