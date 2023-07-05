import type {ChartKitHolidays} from '../../../../types';
import type {
    ExtendedHChart,
    Highcharts,
    HighchartsComment,
    HighchartsWidgetData,
    XAxisItem,
} from '../../types';

import {addHolidays} from './add-holidays';
import {drawComments} from './comments/drawing';
import {prepareConfig} from './config/config';
import './graph.scss';
import {initHighcharts} from './highcharts/highcharts';
import {prepareData} from './prepare-data';
import type {ConfigOptions} from './types';

type GetGraphArgs = {
    options: ConfigOptions;
    data: HighchartsWidgetData['data'];
    comments?: HighchartsComment[];
    holidays?: ChartKitHolidays;
    isMobile?: boolean;
};

let highchartsInitialized = false;

function getGraph({options, data, comments, isMobile, holidays}: GetGraphArgs) {
    if (!highchartsInitialized) {
        highchartsInitialized = true;
        initHighcharts({isMobile});
    }

    prepareData(data, options, holidays);

    return {
        config: {
            _externalComments: (!options.disableExternalComments && comments) || [],
            _internalComments: data.comments || [],
            ...prepareConfig(data, options, isMobile, holidays),
        },
        callback: (chart: ExtendedHChart) => {
            if (!chart) {
                console.error('CHARTKIT_NO_CHART_CALLBACK');
                return;
            }

            chart.userOptions._getComments = () =>
                chart.userOptions?._internalComments.concat(chart.userOptions?._externalComments);

            let needRedraw = false;

            chart.series.forEach((serie) => {
                if (serie.userOptions.noCheckNullValues) {
                    return;
                }

                if (
                    ['line', 'spline', 'area', 'stack'].includes(serie.type) &&
                    !serie.options.connectNulls
                ) {
                    const {data} = serie;
                    data.forEach((point, index) => {
                        if (
                            point.y !== null &&
                            (data[index - 1] === undefined ||
                                // eslint-disable-next-line eqeqeq, no-eq-null
                                data[index - 1].y == null) &&
                            // eslint-disable-next-line eqeqeq, no-eq-null
                            (index === data.length - 1 || data[index + 1].y == null)
                        ) {
                            point.update(
                                {
                                    marker: {enabled: true},
                                    x: point.x,
                                } as Highcharts.PointOptionsType,
                                false,
                                false,
                            );
                            needRedraw = true;
                        }
                    });
                }
            });

            if (options.highstock) {
                let extmin;
                let extmax;

                if (options.extremes && options.extremes.min && options.extremes.max) {
                    extmin = options.extremes.min;
                    extmax = options.extremes.max;
                } else if (options.highstock.range_min && options.highstock.range_max) {
                    extmin = parseInt(
                        (options.highstock.override_range_min ||
                            options.highstock.range_min) as string,
                        10,
                    );
                    extmax = parseInt(
                        (options.highstock.override_range_max ||
                            options.highstock.range_max) as string,
                        10,
                    );
                }

                if (extmin && extmax) {
                    // https://github.com/highcharts/highcharts/issues/9028
                    const xAxis =
                        chart.xAxis.find(
                            (xAxis) =>
                                !chart.navigator ||
                                xAxis !== (chart.navigator.xAxis as unknown as Highcharts.Axis),
                        ) || chart.navigator?.xAxis;
                    extmin = Math.max(chart.xAxis[0]?.dataMin, extmin);
                    extmax = Math.min(chart.xAxis[0].dataMax, extmax);
                    (xAxis as XAxisItem)?.setExtremes(extmin, extmax, false, false);
                    needRedraw = true;
                }
            }

            if (holidays && !options.hideHolidaysBands) {
                if (needRedraw) {
                    addHolidays(chart, holidays);
                } else {
                    needRedraw = addHolidays(chart, holidays);
                }
            }

            if (needRedraw) {
                chart.redraw();
            }

            if (chart && chart.userOptions._getComments()) {
                drawComments(chart, chart.userOptions._getComments(), chart.userOptions._config);
            }

            chart.userOptions.isCallbackCalled = true;
        },
    };
}

export {getGraph};
