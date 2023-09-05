import React from 'react';
import get from 'lodash/get';

import type {ChartKitWidgetSeriesData, TooltipHoveredData} from '../../../../../types/widget-data';

import type {PreparedAxis} from '../../hooks';
import {getDataCategoryValue} from '../../utils';

type Props = {
    hovered: TooltipHoveredData;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
};

const getXRowData = (xAxis: PreparedAxis, data: ChartKitWidgetSeriesData) => {
    const categories = get(xAxis, 'categories', [] as string[]);

    return xAxis.type === 'category'
        ? getDataCategoryValue({axisType: 'x', categories, data})
        : (data as {x: number}).x;
};

const getYRowData = (yAxis: PreparedAxis, data: ChartKitWidgetSeriesData) => {
    const categories = get(yAxis, 'categories', [] as string[]);

    return yAxis.type === 'category'
        ? getDataCategoryValue({axisType: 'y', categories, data})
        : (data as {y: number}).y;
};

export const DefaultContent = ({hovered, xAxis, yAxis}: Props) => {
    const {data, series} = hovered;

    switch (series.type) {
        case 'scatter': {
            const xRow = getXRowData(xAxis, data);
            const yRow = getYRowData(yAxis, data);

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
            const xRow = getXRowData(xAxis, data);
            const yRow = getYRowData(yAxis, data);

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
