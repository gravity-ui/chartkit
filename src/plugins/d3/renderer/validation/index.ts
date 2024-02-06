import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';

import {SeriesType} from '../../../../constants';
import {ChartKitError, CHARTKIT_ERROR_CODE} from '../../../../libs';
import {
    AreaSeries,
    BarXSeries,
    BarYSeries,
    ChartKitWidgetAxis,
    ChartKitWidgetData,
    ChartKitWidgetSeries,
    LineSeries,
    PieSeries,
    ScatterSeries,
} from '../../../../types';
import {i18n} from '../../../../i18n';

import {DEFAULT_AXIS_TYPE} from '../constants';

type XYSeries = ScatterSeries | BarXSeries | BarYSeries | LineSeries | AreaSeries;

const AVAILABLE_SERIES_TYPES = Object.values(SeriesType);

const validateXYSeries = (args: {
    series: XYSeries;
    xAxis?: ChartKitWidgetAxis;
    yAxis?: ChartKitWidgetAxis;
}) => {
    const {series, xAxis, yAxis} = args;
    const xType = get(xAxis, 'type', DEFAULT_AXIS_TYPE);
    const yType = get(yAxis, 'type', DEFAULT_AXIS_TYPE);
    series.data.forEach(({x, y}) => {
        switch (xType) {
            case 'category': {
                if (typeof x !== 'string' && typeof x !== 'number') {
                    throw new ChartKitError({
                        code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                        message: i18n('error', 'label_invalid-axis-category-data-point', {
                            key: 'x',
                            seriesName: series.name,
                        }),
                    });
                }

                break;
            }
            case 'datetime': {
                if (typeof x !== 'number') {
                    throw new ChartKitError({
                        code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                        message: i18n('error', 'label_invalid-axis-datetime-data-point', {
                            key: 'x',
                            seriesName: series.name,
                        }),
                    });
                }

                break;
            }
            case 'linear': {
                if (typeof x !== 'number' && x !== null) {
                    throw new ChartKitError({
                        code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                        message: i18n('error', 'label_invalid-axis-linear-data-point', {
                            key: 'x',
                            seriesName: series.name,
                        }),
                    });
                }
            }
        }
        switch (yType) {
            case 'category': {
                if (typeof y !== 'string' && typeof y !== 'number') {
                    throw new ChartKitError({
                        code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                        message: i18n('error', 'label_invalid-axis-category-data-point', {
                            key: 'y',
                            seriesName: series.name,
                        }),
                    });
                }

                break;
            }
            case 'datetime': {
                if (typeof y !== 'number') {
                    throw new ChartKitError({
                        code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                        message: i18n('error', 'label_invalid-axis-datetime-data-point', {
                            key: 'y',
                            seriesName: series.name,
                        }),
                    });
                }

                break;
            }
            case 'linear': {
                if (typeof y !== 'number' && y !== null) {
                    throw new ChartKitError({
                        code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                        message: i18n('error', 'label_invalid-axis-linear-data-point', {
                            key: 'y',
                            seriesName: series.name,
                        }),
                    });
                }
            }
        }
    });
};

const validatePieSeries = ({series}: {series: PieSeries}) => {
    series.data.forEach(({value}) => {
        if (typeof value !== 'number') {
            throw new ChartKitError({
                code: CHARTKIT_ERROR_CODE.INVALID_DATA,
                message: i18n('error', 'label_invalid-pie-data-value'),
            });
        }
    });
};

const validateStacking = ({series}: {series: AreaSeries | BarXSeries | BarYSeries}) => {
    const availableStackingValues = ['normal', 'percent'];

    if (series.stacking && !availableStackingValues.includes(series.stacking)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.INVALID_DATA,
            message: i18n('error', 'label_invalid-series-property', {
                key: 'stacking',
                values: availableStackingValues,
            }),
        });
    }
};

const validateSeries = (args: {
    series: ChartKitWidgetSeries;
    xAxis?: ChartKitWidgetAxis;
    yAxis?: ChartKitWidgetAxis;
}) => {
    const {series, xAxis, yAxis} = args;

    if (!AVAILABLE_SERIES_TYPES.includes(series.type)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.INVALID_DATA,
            message: i18n('error', 'label_invalid-series-type', {
                types: AVAILABLE_SERIES_TYPES.join(', '),
            }),
        });
    }

    switch (series.type) {
        case 'area':
        case 'bar-y':
        case 'bar-x': {
            validateXYSeries({series, xAxis, yAxis});
            validateStacking({series});
            break;
        }
        case 'line':
        case 'scatter': {
            validateXYSeries({series, xAxis, yAxis});
            break;
        }
        case 'pie': {
            validatePieSeries({series});
        }
    }
};

const countSeriesByType = (args: {
    series: ChartKitWidgetSeries[];
    type: ChartKitWidgetSeries['type'];
}) => {
    const {series, type} = args;
    let count = 0;

    series.forEach((s) => {
        if (s.type === type) {
            count += 1;
        }
    });

    return count;
};

export const validateData = (data?: ChartKitWidgetData) => {
    if (isEmpty(data) || isEmpty(data.series) || isEmpty(data.series.data)) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.NO_DATA,
            message: i18n('error', 'label_no-data'),
        });
    }

    if (data.series.data.some((s) => isEmpty(s.data))) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.INVALID_DATA,
            message: 'You should specify data for all series',
        });
    }

    const treemapSeriesCount = countSeriesByType({
        series: data.series.data,
        type: SeriesType.Treemap,
    });

    if (treemapSeriesCount > 1) {
        throw new ChartKitError({
            code: CHARTKIT_ERROR_CODE.INVALID_DATA,
            message: 'It looks like you are trying to define more than one "treemap" series.',
        });
    }

    data.series.data.forEach((series) => {
        validateSeries({series, yAxis: data.yAxis?.[0], xAxis: data.xAxis});
    });
};
