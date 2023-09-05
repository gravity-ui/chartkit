import React from 'react';
import get from 'lodash/get';
import {dateTime} from '@gravity-ui/date-utils';
import type {ChartKitWidgetSeriesData, TooltipHoveredData} from '../../../../../types';
import {formatNumber} from '../../../../shared';
import type {PreparedAxis} from '../../hooks';
import {getDataCategoryValue} from '../../utils';

type Props = {
    hovered: TooltipHoveredData;
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
};

const DEFAULT_DATE_FORMAT = 'DD.MM.YY';

const getRowData = (fieldName: 'x' | 'y', axis: PreparedAxis, data: ChartKitWidgetSeriesData) => {
    const categories = get(axis, 'categories', [] as string[]);

    switch (axis.type) {
        case 'category': {
            return getDataCategoryValue({axisDirection: fieldName, categories, data});
        }
        case 'datetime': {
            const value = get(data, fieldName);
            return dateTime({input: value}).format(DEFAULT_DATE_FORMAT);
        }
        case 'linear':
        default: {
            const value = get(data, fieldName) as unknown as number;
            return formatNumber(value);
        }
    }
};

const getXRowData = (xAxis: PreparedAxis, data: ChartKitWidgetSeriesData) =>
    getRowData('x', xAxis, data);

const getYRowData = (yAxis: PreparedAxis, data: ChartKitWidgetSeriesData) =>
    getRowData('y', yAxis, data);

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
