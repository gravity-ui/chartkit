import React from 'react';
import get from 'lodash/get';
import {dateTime} from '@gravity-ui/date-utils';
import type {ChartKitWidgetSeriesData, TooltipDataChunk} from '../../../../../types';
import {formatNumber} from '../../../../shared';
import type {PreparedAxis, PreparedPieSeries} from '../../hooks';
import {getDataCategoryValue} from '../../utils';

type Props = {
    hovered: TooltipDataChunk[];
    xAxis: PreparedAxis;
    yAxis: PreparedAxis;
};

const DEFAULT_DATE_FORMAT = 'DD.MM.YY';

const getRowData = (fieldName: 'x' | 'y', axis: PreparedAxis, data: ChartKitWidgetSeriesData) => {
    switch (axis.type) {
        case 'category': {
            const categories = get(axis, 'categories', [] as string[]);
            return getDataCategoryValue({axisDirection: fieldName, categories, data});
        }
        case 'datetime': {
            const value = get(data, fieldName);
            if (!value) {
                return undefined;
            }
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
    return (
        <>
            {hovered.map(({data, series}, i) => {
                const id = get(series, 'id', i);

                switch (series.type) {
                    case 'scatter':
                    case 'line':
                    case 'area':
                    case 'bar-x': {
                        const xRow = getXRowData(xAxis, data);
                        const yRow = getYRowData(yAxis, data);

                        return (
                            <div key={id}>
                                <div>{xRow}</div>
                                <div>
                                    <span>
                                        <b>{series.name}</b>: {yRow}
                                    </span>
                                </div>
                            </div>
                        );
                    }
                    case 'bar-y': {
                        const xRow = getXRowData(xAxis, data);
                        const yRow = getYRowData(yAxis, data);

                        return (
                            <div key={id}>
                                <div>{yRow}</div>
                                <div>
                                    <span>
                                        <b>{series.name}</b>: {xRow}
                                    </span>
                                </div>
                            </div>
                        );
                    }
                    case 'pie': {
                        const pieSeriesData = data as PreparedPieSeries;

                        return (
                            <div key={id}>
                                <span>{pieSeriesData.name || pieSeriesData.id}&nbsp;</span>
                                <span>{pieSeriesData.value}</span>
                            </div>
                        );
                    }
                    default: {
                        return null;
                    }
                }
            })}
        </>
    );
};
