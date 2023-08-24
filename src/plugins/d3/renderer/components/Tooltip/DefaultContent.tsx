import React from 'react';

import type {
    ScatterSeriesData,
    BarXSeriesData,
    TooltipHoveredData,
} from '../../../../../types/widget-data';

import type {PreparedAxis} from '../../hooks';

type Props = {
    hovered: TooltipHoveredData;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
};

export const DefaultContent = ({hovered, xAxis, yAxis}: Props) => {
    const {data, series} = hovered;

    switch (series.type) {
        case 'scatter': {
            const scatterData = data as ScatterSeriesData;
            const xRow = xAxis.type === 'category' ? scatterData.category : scatterData.x;
            const yRow = yAxis.type === 'category' ? scatterData.category : scatterData.y;
            return (
                <div>
                    <div>
                        <span>X:&nbsp;</span>
                        <b>{xRow}</b>
                    </div>
                    <div>
                        <span>Y:&nbsp;</span>
                        <b>{yRow}</b>
                    </div>
                </div>
            );
        }
        case 'bar-x': {
            const barXData = data as BarXSeriesData;
            const xRow = xAxis.type === 'category' ? barXData.category : barXData.x;
            const yRow = yAxis.type === 'category' ? barXData.category : barXData.y;
            return (
                <div>
                    <div>{xRow}</div>
                    <div>
                        <span>
                            <b>{series.name}</b>: {yRow}
                        </span>
                    </div>
                </div>
            );
        }
        default: {
            return null;
        }
    }
};
