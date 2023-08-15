import React from 'react';

import type {ScatterSeriesData, TooltipHoveredData} from '../../../../../types/widget-data';

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
        default: {
            return null;
        }
    }
};
